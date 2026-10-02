import  pool  from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const getActivity = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const isClient = req.user.role === "client";

  let query = `
    SELECT 
      a.id, a.actor_id, a.actor_type, a.event_type, 
      a.related_entity_type, a.related_entity_id, 
      a.visibility, a.metadata, a.created_at,
      u.name AS actor_name, u.email AS actor_email
    FROM activity_logs a
    LEFT JOIN users u ON a.actor_id = u.id
    WHERE a.agency_id = ?
  `;

  const params = [agencyId];

  // Client users can ONLY see events marked as client-visible
  if (isClient) {
    query += " AND a.visibility = 'client'";
  }

  query += " ORDER BY a.created_at DESC LIMIT 50";

  const [activities] = await pool.query(query, params);

  return res
    .status(200)
    .json(new ApiResponse(200, activities, "Activity timeline retrieved."));
});
