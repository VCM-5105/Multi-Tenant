import crypto from "crypto";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const getClients = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;

  const [clients] = await pool.query(
    `SELECT 
      c.id, c.company_name, c.primary_contact_person, c.email, c.phone, c.notes, c.created_at,
      COUNT(p.id) AS total_projects
     FROM clients c
     LEFT JOIN projects p ON c.id = p.client_id
     WHERE c.agency_id = ?
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    [agencyId]
  );

  return res
    .status(200)
    .json(new ApiResponse(200, clients, "Clients retrieved successfully."));
});

export const getClientById = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { id } = req.params;

  const [clients] = await pool.query(
    "SELECT * FROM clients WHERE id = ? AND agency_id = ?",
    [id, agencyId]
  );

  if (clients.length === 0) {
    throw new ApiError(404, "Client not found or does not belong to your agency.");
  }

  const [projects] = await pool.query(
    "SELECT id, name, status, priority, created_at FROM projects WHERE client_id = ? AND agency_id = ?",
    [id, agencyId]
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { client: clients[0], projects },
      "Client details retrieved."
    )
  );
});

export const createClient = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { company_name, primary_contact_person, email, phone, notes } = req.body;

  if (!company_name || !primary_contact_person || !email) {
    throw new ApiError(400, "Company name, primary contact person, and email are required.");
  }

  const clientId = "cli-" + crypto.randomUUID().slice(0, 8);

  await pool.query(
    `INSERT INTO clients (id, agency_id, company_name, primary_contact_person, email, phone, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [clientId, agencyId, company_name.trim(), primary_contact_person.trim(), email.trim(), phone || null, notes || null]
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      { id: clientId, company_name, primary_contact_person, email, phone, notes },
      "Client company created successfully."
    )
  );
});


export const updateClient = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { id } = req.params;
  const { company_name, primary_contact_person, email, phone, notes } = req.body;

  const [existing] = await pool.query(
    "SELECT id FROM clients WHERE id = ? AND agency_id = ?",
    [id, agencyId]
  );

  if (existing.length === 0) {
    throw new ApiError(404, "Client not found or unauthorized.");
  }

  await pool.query(
    `UPDATE clients 
     SET company_name = COALESCE(?, company_name),
         primary_contact_person = COALESCE(?, primary_contact_person),
         email = COALESCE(?, email),
         phone = COALESCE(?, phone),
         notes = COALESCE(?, notes)
     WHERE id = ? AND agency_id = ?`,
    [company_name, primary_contact_person, email, phone, notes, id, agencyId]
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Client updated successfully."));
});


export const createClientUser = asynchandler(async (req, res) => {
  const agencyId = req.agencyId;
  const { id } = req.params; // client_id
  const { name, email, password, designation } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  const [clients] = await pool.query(
    "SELECT id, company_name FROM clients WHERE id = ? AND agency_id = ?",
    [id, agencyId]
  );

  if (clients.length === 0) {
    throw new ApiError(404, "Client company not found or unauthorized.");
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
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, global_role, is_active)
       VALUES (?, ?, ?, ?, 'user', TRUE)`,
      [userId, name.trim(), cleanEmail, hashedPassword]
    );
  }

  const [existingMember] = await pool.query(
    "SELECT id FROM client_members WHERE client_id = ? AND user_id = ?",
    [id, userId]
  );

  if (existingMember.length > 0) {
    throw new ApiError(409, "This user is already a member of this client company.");
  }

  const clientMemberId = "climem-" + crypto.randomUUID().slice(0, 8);
  await pool.query(
    `INSERT INTO client_members (id, agency_id, client_id, user_id, designation)
     VALUES (?, ?, ?, ?, ?)`,
    [clientMemberId, agencyId, id, userId, designation || null]
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: clientMemberId,
        userId,
        client_id: id,
        company_name: clients[0].company_name,
        name: name.trim(),
        email: cleanEmail,
        designation: designation || null,
      },
      "Client portal user created successfully. They can now log in!"
    )
  );
});
