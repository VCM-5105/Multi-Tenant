import crypto from "crypto";
import pool from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { recordActivity } from "../services/activity.service.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const getMeetings = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const isClient = req.user.role === "client";
  const clientId = req.user.clientId;
  const { project_id } = req.query;

  let query = `
    SELECT 
      m.id, m.title, m.meeting_date, m.notes, m.is_shared_with_client, m.created_at,
      p.id AS project_id, p.name AS project_name,
      u.id AS created_by_id, u.name AS created_by_name
    FROM meetings m
    JOIN projects p ON m.project_id = p.id
    LEFT JOIN users u ON m.created_by = u.id
    WHERE m.agency_id = ?
  `;

  const params = [agencyId];

  // Client visibility restrictions
  if (isClient) {
    query += " AND p.client_id = ? AND m.is_shared_with_client = TRUE";
    params.push(clientId);
  }

  if (project_id) {
    query += " AND m.project_id = ?";
    params.push(project_id);
  }

  query += " ORDER BY m.meeting_date DESC";

  const [meetings] = await pool.query(query, params);

  return res
    .status(200)
    .json(new ApiResponse(200, meetings, "Meetings retrieved successfully."));
});


export const createMeeting = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const userId = req.user.userId;
  const { project_id, title, meeting_date, notes, is_shared_with_client } = req.body;

  if (!project_id || !title || !meeting_date || !notes) {
    throw new ApiError(400, "Project ID, title, meeting date, and notes are required.");
  }

  // Verify project belongs to this agency
  const [project] = await pool.query(
    "SELECT id, name FROM projects WHERE id = ? AND agency_id = ?",
    [project_id, agencyId]
  );

  if (project.length === 0) {
    throw new ApiError(400, "Specified project does not belong to your agency.");
  }

  const meetingId = "meet-" + crypto.randomUUID().slice(0, 8);
  const sharedFlag = Boolean(is_shared_with_client);

  await pool.query(
    `INSERT INTO meetings 
      (id, agency_id, project_id, created_by, title, meeting_date, notes, is_shared_with_client)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [meetingId, agencyId, project_id, userId, title.trim(), meeting_date, notes.trim(), sharedFlag]
  );

  // Record in audit activity feed
  await recordActivity({
    agencyId,
    actorId: userId,
    actorType: "agency_user",
    eventType: "meeting.recorded",
    relatedEntityType: "project",
    relatedEntityId: project_id,
    visibility: sharedFlag ? "client" : "internal",
    metadata: { title, sharedWithClient: sharedFlag },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: meetingId,
        project_id,
        title,
        meeting_date,
        is_shared_with_client: sharedFlag,
      },
      "Meeting recorded successfully."
    )
  );
});

export const summarizeMeeting = asynchandler(async (req, res) => {
  const { id } = req.params;
  const agencyId = req.agencyId;
  // 1. Fetch meeting notes from MySQL
  const [meetings] = await pool.query(
    "SELECT title, notes FROM meetings WHERE id = ? AND agency_id = ?",
    [id, agencyId],
  );
  if (meetings.length === 0) {
    throw new ApiError(404, "Meeting not found.");
  }
  const meeting = meetings[0];
  // 2. Call Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
  const prompt = `
    You are an executive assistant for a digital agency.
    Analyze the following meeting notes and provide a clean, professional summary with:
    1. Key Discussion Points (2-3 bullets)
    2. Decisions Made (1-2 bullets)
    3. Action Items & Next Steps (checklist format)
    Meeting Title: "${meeting.title}"
    Raw Notes:
    """
    ${meeting.notes}
    """
  `;
  const result = await model.generateContent(prompt);
  const aiSummary = result.response.text();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { aiSummary },
        "AI meeting summary generated successfully.",
      ),
    );
});

