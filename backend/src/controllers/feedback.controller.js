import crypto from "crypto";
import pool from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { recordActivity } from "../services/activity.service.js";

export const getFeedback = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const isClient = req.user.role === "client";
  const clientId = req.user.clientId;
  const { project_id, status } = req.query;

  let query = `
    SELECT 
      f.id, f.title, f.description, f.status, f.agency_response, f.created_at, f.updated_at,
      p.id AS project_id, p.name AS project_name,
      u.id AS submitter_id, u.name AS submitter_name, u.email AS submitter_email
    FROM feedback_requests f
    JOIN projects p ON f.project_id = p.id
    LEFT JOIN users u ON f.submitted_by = u.id
    WHERE f.agency_id = ?
  `;

  const params = [agencyId];

  // Client scoping
  if (isClient) {
    query += " AND p.client_id = ?";
    params.push(clientId);
  }

  if (project_id) {
    query += " AND f.project_id = ?";
    params.push(project_id);
  }

  if (status) {
    query += " AND f.status = ?";
    params.push(status);
  }

  query += " ORDER BY f.created_at DESC";

  const [feedbackList] = await pool.query(query, params);

  return res
    .status(200)
    .json(new ApiResponse(200, feedbackList, "Feedback retrieved successfully."));
});

export const createFeedback = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const userId = req.user.userId;
  const isClient = req.user.role === "client";
  const clientId = req.user.clientId;
  const { project_id, title, description } = req.body;

  if (!project_id || !title || !description) {
    throw new ApiError(400, "Project ID, title, and description are required.");
  }

  let projectCheckQuery = "SELECT id, name FROM projects WHERE id = ? AND agency_id = ?";
  const checkParams = [project_id, agencyId];

  if (isClient) {
    projectCheckQuery += " AND client_id = ?";
    checkParams.push(clientId);
  }

  const [project] = await pool.query(projectCheckQuery, checkParams);

  if (project.length === 0) {
    throw new ApiError(403, "You are not authorized to submit feedback for this project.");
  }

  const feedbackId = "fb-" + crypto.randomUUID().slice(0, 8);

  await pool.query(
    `INSERT INTO feedback_requests 
      (id, agency_id, project_id, submitted_by, title, description, status)
     VALUES (?, ?, ?, ?, ?, ?, 'open')`,
    [feedbackId, agencyId, project_id, userId, title.trim(), description.trim()]
  );

  await recordActivity({
    agencyId,
    actorId: userId,
    actorType: isClient ? "client_user" : "agency_user",
    eventType: "feedback.submitted",
    relatedEntityType: "project",
    relatedEntityId: project_id,
    visibility: "client",
    metadata: { title, feedbackId },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: feedbackId,
        project_id,
        title,
        status: "open",
      },
      "Feedback request submitted successfully."
    )
  );
});

export const updateFeedback = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { id } = req.params;
  const { status, agency_response } = req.body;

  const validStatuses = ["open", "in_review", "in_progress", "resolved", "declined"];
  if (status && !validStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const [existing] = await pool.query(
    "SELECT id, project_id, title FROM feedback_requests WHERE id = ? AND agency_id = ?",
    [id, agencyId]
  );

  if (existing.length === 0) {
    throw new ApiError(404, "Feedback request not found or unauthorized.");
  }

  await pool.query(
    `UPDATE feedback_requests 
     SET status = COALESCE(?, status),
         agency_response = COALESCE(?, agency_response)
     WHERE id = ? AND agency_id = ?`,
    [status, agency_response, id, agencyId]
  );

  await recordActivity({
    agencyId,
    actorId: req.user.userId,
    actorType: "agency_user",
    eventType: "feedback.status_updated",
    relatedEntityType: "feedback",
    relatedEntityId: id,
    visibility: "client",
    metadata: { status, title: existing[0].title },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { id, status, agency_response },
      "Feedback request updated successfully."
    )
  );
});
