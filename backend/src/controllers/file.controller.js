import crypto from "crypto";
import path from "path";
import fs from "fs";
import pool  from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { recordActivity } from "../services/activity.service.js";

export const uploadFile = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const userId = req.user.userId;

  if (!req.file) {
    throw new ApiError(400, "No file uploaded.");
  }

  const { project_id, task_id, feedback_id, is_shared_with_client } = req.body;

  if (!project_id) {
    throw new ApiError(400, "Project ID is required to attach a file.");
  }

  
  const [project] = await pool.query(
    "SELECT id FROM projects WHERE id = ? AND agency_id = ?",
    [project_id, agencyId]
  );

  if (project.length === 0) {
    throw new ApiError(400, "Specified project does not belong to your agency.");
  }

  const fileId = "file-" + crypto.randomUUID().slice(0, 8);
  const sharedFlag = Boolean(is_shared_with_client === "true" || is_shared_with_client === true);

  await pool.query(
    `INSERT INTO files 
      (id, agency_id, project_id, task_id, feedback_id, uploaded_by, file_name, file_path, file_size, mime_type, is_shared_with_client)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fileId,
      agencyId,
      project_id,
      task_id || null,
      feedback_id || null,
      userId,
      req.file.originalname,
      req.file.filename,
      req.file.size,
      req.file.mimetype,
      sharedFlag,
    ]
  );

 
  await recordActivity({
    agencyId,
    actorId: userId,
    actorType: "agency_user",
    eventType: "file.uploaded",
    relatedEntityType: "project",
    relatedEntityId: project_id,
    visibility: sharedFlag ? "client" : "internal",
    metadata: { fileName: req.file.originalname, sharedWithClient: sharedFlag },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: fileId,
        project_id,
        file_name: req.file.originalname,
        file_size: req.file.size,
        is_shared_with_client: sharedFlag,
      },
      "File uploaded and attached successfully."
    )
  );
});

export const getFiles = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const isClient = req.user.role === "client";
  const clientId = req.user.clientId;
  const { project_id } = req.query;

  let query = `
    SELECT 
      f.id, f.file_name, f.file_size, f.mime_type, f.is_shared_with_client, f.created_at,
      p.id AS project_id, p.name AS project_name,
      u.name AS uploader_name
    FROM files f
    JOIN projects p ON f.project_id = p.id
    LEFT JOIN users u ON f.uploaded_by = u.id
    WHERE f.agency_id = ?
  `;

  const params = [agencyId];

  if (isClient) {
    query += " AND p.client_id = ? AND f.is_shared_with_client = TRUE";
    params.push(clientId);
  }

  if (project_id) {
    query += " AND f.project_id = ?";
    params.push(project_id);
  }

  query += " ORDER BY f.created_at DESC";

  const [files] = await pool.query(query, params);

  return res
    .status(200)
    .json(new ApiResponse(200, files, "Files retrieved successfully."));
});

export const downloadFile = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const isClient = req.user.role === "client";
  const clientId = req.user.clientId;
  const { id } = req.params;

  let query = `
    SELECT f.*, p.client_id
    FROM files f
    JOIN projects p ON f.project_id = p.id
    WHERE f.id = ? AND f.agency_id = ?
  `;

  const [files] = await pool.query(query, [id, agencyId]);

  if (files.length === 0) {
    throw new ApiError(404, "File not found or does not belong to your agency.");
  }

  const file = files[0];

  if (isClient) {
    if (file.client_id !== clientId || !file.is_shared_with_client) {
      throw new ApiError(403, "Access denied: You do not have permission to download this file.");
    }
  }

  const fullPath = path.resolve("uploads", file.file_path);

  if (!fs.existsSync(fullPath)) {
    throw new ApiError(404, "Physical file not found on server.");
  }

  return res.download(fullPath, file.file_name);
});
