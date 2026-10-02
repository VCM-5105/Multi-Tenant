import crypto from "crypto";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const getTeamMembers = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;

  const [members] = await pool.query(
    `SELECT 
      m.id AS membership_id, m.role, m.job_title, m.created_at,
      u.id AS user_id, u.name, u.email, u.is_active
     FROM agency_members m
     JOIN users u ON m.user_id = u.id
     WHERE m.agency_id = ?
     ORDER BY m.created_at ASC`,
    [agencyId]
  );

  return res
    .status(200)
    .json(new ApiResponse(200, members, "Team members retrieved successfully."));
});

export const addTeamMember = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { name, email, role, job_title, password } = req.body;

  if (!name || !email || !role) {
    throw new ApiError(400, "Name, email, and role (agency_admin or agency_team) are required.");
  }

  if (!["agency_admin", "agency_team"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be 'agency_admin' or 'agency_team'.");
  }

  const cleanEmail = email.toLowerCase().trim();

 
  const [existingUsers] = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [cleanEmail]
  );

  let userId;
  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    
    userId = "usr-" + crypto.randomUUID().slice(0, 8);
    const hash = await bcrypt.hash(password || "password", 10);

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, global_role, is_active)
       VALUES (?, ?, ?, ?, 'user', TRUE)`,
      [userId, name.trim(), cleanEmail, hash]
    );
  }

  
  const [existingMembership] = await pool.query(
    "SELECT id FROM agency_members WHERE agency_id = ? AND user_id = ?",
    [agencyId, userId]
  );

  if (existingMembership.length > 0) {
    throw new ApiError(409, "This user is already a member of this agency.");
  }

  const membershipId = "mem-" + crypto.randomUUID().slice(0, 8);
  await pool.query(
    `INSERT INTO agency_members (id, agency_id, user_id, role, job_title)
     VALUES (?, ?, ?, ?, ?)`,
    [membershipId, agencyId, userId, role, job_title || null]
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        membershipId,
        userId,
        name,
        email: cleanEmail,
        role,
        job_title,
      },
      "Team member added successfully."
    )
  );
});
