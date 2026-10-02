import pool  from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateToken } from "../utils/token.util.js";
import { recordActivity } from "../services/activity.service.js";

export const getPlatformStats = asynchandler(async (req, res) => {
 
  const [agencyCounts] = await pool.query(`
    SELECT 
      COUNT(*) AS total_agencies,
      COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_agencies,
      COUNT(CASE WHEN status = 'suspended' THEN 1 END) AS suspended_agencies,
      COUNT(CASE WHEN status = 'inactive' THEN 1 END) AS inactive_agencies
    FROM agencies
  `);


  const [[{ total_users }]] = await pool.query(
    "SELECT COUNT(*) AS total_users FROM users WHERE global_role != 'super_admin'"
  );
  const [[{ total_clients }]] = await pool.query(
    "SELECT COUNT(*) AS total_clients FROM clients"
  );
  const [[{ total_projects }]] = await pool.query(
    "SELECT COUNT(*) AS total_projects FROM projects"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        agencies: agencyCounts[0],
        total_users,
        total_clients,
        total_projects,
      },
      "Platform metrics retrieved successfully."
    )
  );
});


export const getAllAgencies = asynchandler(async (req, res) => {
  const { search, status } = req.query;

  let query = `
    SELECT 
      a.id, a.name, a.slug, a.plan, a.status, a.primary_email, a.phone, a.created_at,
      COUNT(DISTINCT m.id) AS member_count,
      COUNT(DISTINCT c.id) AS client_count,
      COUNT(DISTINCT p.id) AS project_count
    FROM agencies a
    LEFT JOIN agency_members m ON a.id = m.agency_id
    LEFT JOIN clients c ON a.id = c.agency_id
    LEFT JOIN projects p ON a.id = p.agency_id
    WHERE 1=1
  `;

  const params = [];

  if (status) {
    query += " AND a.status = ?";
    params.push(status);
  }

  if (search) {
    query += " AND (a.name LIKE ? OR a.primary_email LIKE ? OR a.slug LIKE ?)";
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  query += " GROUP BY a.id ORDER BY a.created_at DESC";

  const [agencies] = await pool.query(query, params);

  return res
    .status(200)
    .json(new ApiResponse(200, agencies, "Agencies retrieved successfully."));
});

export const getAgencyDetail = asynchandler(async (req, res) => {
  const { id } = req.params;

  const [agencies] = await pool.query(
    "SELECT * FROM agencies WHERE id = ?",
    [id]
  );

  if (agencies.length === 0) {
    throw new ApiError(404, "Agency not found.");
  }

  const agency = agencies[0];

  const [members] = await pool.query(
    `SELECT m.id, m.role, m.job_title, u.id AS user_id, u.name, u.email 
     FROM agency_members m
     JOIN users u ON m.user_id = u.id
     WHERE m.agency_id = ?`,
    [id]
  );

  const [clients] = await pool.query(
    "SELECT id, company_name, primary_contact_person, email FROM clients WHERE agency_id = ?",
    [id]
  );

  const [projects] = await pool.query(
    "SELECT id, name, status, priority, created_at FROM projects WHERE agency_id = ?",
    [id]
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { agency, members, clients, projects },
      "Agency details retrieved."
    )
  );
});

export const updateAgencyStatus = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["active", "suspended", "inactive"];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`
    );
  }

  const [existing] = await pool.query(
    "SELECT id, name, status FROM agencies WHERE id = ?",
    [id]
  );

  if (existing.length === 0) {
    throw new ApiError(404, "Agency not found.");
  }

  await pool.query("UPDATE agencies SET status = ? WHERE id = ?", [status, id]);


  await recordActivity({
    agencyId: id,
    actorId: req.user.userId,
    actorType: "super_admin",
    eventType: "agency.status_changed",
    relatedEntityType: "agency",
    relatedEntityId: id,
    visibility: "internal",
    metadata: { previousStatus: existing[0].status, newStatus: status },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { id, status },
      `Agency status updated to "${status}".`
    )
  );
});

export const enterSupportMode = asynchandler(async (req, res) => {
  const { id } = req.params;

  const [agencies] = await pool.query(
    "SELECT id, name, slug, status FROM agencies WHERE id = ?",
    [id]
  );

  if (agencies.length === 0) {
    throw new ApiError(404, "Agency not found.");
  }

  const agency = agencies[0];

 
  const supportToken = generateToken({
    userId: req.user.userId,
    email: req.user.email,
    name: req.user.name,
    role: "super_admin",
    agencyId: agency.id,
    isSupportMode: true,
  });

  await recordActivity({
    agencyId: agency.id,
    actorId: req.user.userId,
    actorType: "super_admin",
    eventType: "support.session_started",
    relatedEntityType: "agency",
    relatedEntityId: agency.id,
    visibility: "internal",
    metadata: { agencyName: agency.name },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        supportToken,
        agency: {
          id: agency.id,
          name: agency.name,
          slug: agency.slug,
        },
      },
      `Entered Support Mode for "${agency.name}".`
    )
  );
});


export const getPlatformActivity = asynchandler(async (req, res) => {
  const [activities] = await pool.query(`
    SELECT 
      a.id, a.agency_id, a.actor_id, a.actor_type, a.event_type, 
      a.related_entity_type, a.related_entity_id, a.visibility, a.metadata, a.created_at,
      u.name AS actor_name, u.email AS actor_email,
      ag.name AS agency_name
    FROM activity_logs a
    LEFT JOIN users u ON a.actor_id = u.id
    LEFT JOIN agencies ag ON a.agency_id = ag.id
    ORDER BY a.created_at DESC
    LIMIT 100
  `);

  return res
    .status(200)
    .json(new ApiResponse(200, activities, "Platform activity retrieved."));
});
