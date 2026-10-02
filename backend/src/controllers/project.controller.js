import crypto from "crypto";
import pool from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const getProjects = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const isClient = req.user.role === "client";
  const clientId = req.user.clientId;

  //For calculated project values - not static values - means dynamic calculation

  let query = `
    SELECT 
      p.id, p.name, p.description, p.status, p.priority, 
      p.start_date, p.expected_completion_date, p.created_at,
      c.id AS client_id, c.company_name,
      pm.id AS project_manager_id, pm.name AS project_manager_name,
      COUNT(t.id) AS total_tasks,
      COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_tasks,
      COALESCE(
        ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END) / NULLIF(COUNT(t.id), 0)) * 100), 
        0
      ) AS progress_percentage
    FROM projects p
    JOIN clients c ON p.client_id = c.id
    LEFT JOIN users pm ON p.project_manager_id = pm.id
    LEFT JOIN tasks t ON p.id = t.project_id
    WHERE p.agency_id = ?
  `;

  const params = [agencyId];

  if (isClient) {
    query += " AND p.client_id = ?";
    params.push(clientId);
  }

  query += " GROUP BY p.id, c.id, c.company_name, pm.id, pm.name ORDER BY p.created_at DESC";

  const [projects] = await pool.query(query, params);

  return res.status(200).json(
    new ApiResponse(200, projects, "Projects retrieved successfully.")
  );
});

export const getProjectById = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { id } = req.params;
  const isClient = req.user.role === "client";
  const clientId = req.user.clientId;

  let projectQuery = `
    SELECT 
      p.id, p.name, p.description, p.status, p.priority, 
      p.start_date, p.expected_completion_date, p.created_at,
      c.id AS client_id, c.company_name,
      pm.id AS project_manager_id, pm.name AS project_manager_name,
      COUNT(t.id) AS total_tasks,
      COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_tasks,
      COALESCE(
        ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END) / NULLIF(COUNT(t.id), 0)) * 100), 
        0
      ) AS progress_percentage
    FROM projects p
    JOIN clients c ON p.client_id = c.id
    LEFT JOIN users pm ON p.project_manager_id = pm.id
    LEFT JOIN tasks t ON p.id = t.project_id
    WHERE p.id = ? AND p.agency_id = ?
  `;

  const projectParams = [id, agencyId];

  if (isClient) {
    projectQuery += " AND p.client_id = ?";
    projectParams.push(clientId);
  }

  projectQuery += " GROUP BY p.id";

  const [projectRows] = await pool.query(projectQuery, projectParams);

  if (projectRows.length === 0) {
    throw new ApiError(404, "Project not found or unauthorized.");
  }

  const project = projectRows[0];

  const [milestones] = await pool.query(
    "SELECT * FROM milestones WHERE project_id = ? ORDER BY order_index ASC",
    [id]
  );

  const [tasks] = await pool.query(
    `SELECT t.*, u.name AS assignee_name 
     FROM tasks t 
     LEFT JOIN users u ON t.assignee_id = u.id 
     WHERE t.project_id = ? 
     ORDER BY t.created_at ASC`,
    [id]
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { ...project, milestones, tasks },
      "Project details retrieved."
    )
  );
});

export const createProject = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const {
    client_id,
    name,
    description,
    priority,
    start_date,
    expected_completion_date,
    project_manager_id,
  } = req.body;

  if (!client_id || !name) {
    throw new ApiError(400, "Client ID and project name are required.");
  }
  const [client] = await pool.query(
    "SELECT id FROM clients WHERE id = ? AND agency_id = ?",
    [client_id, agencyId]
  );

  if (client.length === 0) {
    throw new ApiError(400, "The specified client does not belong to your agency.");
  }

  const projectId = "proj-" + crypto.randomUUID().slice(0, 8);

  await pool.query(
    `INSERT INTO projects 
      (id, agency_id, client_id, project_manager_id, name, description, status, priority, start_date, expected_completion_date)
     VALUES (?, ?, ?, ?, ?, ?, 'planning', ?, ?, ?)`,
    [
      projectId,
      agencyId,
      client_id,
      project_manager_id || null,
      name.trim(),
      description || null,
      priority || "medium",
      start_date || null,
      expected_completion_date || null,
    ]
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: projectId,
        agency_id: agencyId,
        client_id,
        name,
        status: "planning",
        progress_percentage: 0,
      },
      "Project created successfully."
    )
  );
});

export const updateProject = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { id } = req.params;
  const {
    name,
    description,
    status,
    priority,
    start_date,
    expected_completion_date,
    project_manager_id,
  } = req.body;

  const [existing] = await pool.query(
    "SELECT id FROM projects WHERE id = ? AND agency_id = ?",
    [id, agencyId]
  );

  if (existing.length === 0) {
    throw new ApiError(404, "Project not found or unauthorized.");
  }

  await pool.query(
    `UPDATE projects
     SET name = COALESCE(?, name),
         description = COALESCE(?, description),
         status = COALESCE(?, status),
         priority = COALESCE(?, priority),
         start_date = COALESCE(?, start_date),
         expected_completion_date = COALESCE(?, expected_completion_date),
         project_manager_id = COALESCE(?, project_manager_id)
     WHERE id = ? AND agency_id = ?`,
    [
      name,
      description,
      status,
      priority,
      start_date,
      expected_completion_date,
      project_manager_id,
      id,
      agencyId,
    ]
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Project updated successfully."));
});
