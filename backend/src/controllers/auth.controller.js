import crypto from "crypto";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { generateToken } from "../utils/token.util.js";

export const login = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const [users] = await pool.query(
    "SELECT id, name, email, password_hash, global_role, is_active FROM users WHERE email = ?",
    [email.toLowerCase().trim()]
  );

  if (users.length === 0) {
    throw new ApiError(401, "Email and password length are very short");
  }

  const user = users[0];

  if (!user.is_active) {
    throw new ApiError(403, "Your account has been deactivated.");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  let role = user.global_role;
  let agencyId = null;
  let clientId = null;
  let contextData = {};

  if (user.global_role === "super_admin") {
    role = "super_admin";
    contextData = { title: "Platform Super Admin" };
  } else {
    
    const [agencyMembers] = await pool.query(
      `SELECT m.agency_id, m.role, m.job_title, a.name AS agency_name, a.status AS agency_status 
       FROM agency_members m 
       JOIN agencies a ON m.agency_id = a.id 
       WHERE m.user_id = ?`,
      [user.id]
    );

    if (agencyMembers.length > 0) {
      const member = agencyMembers[0];

      if (member.agency_status === "suspended") {
        throw new ApiError(
          403,
          `Access denied: Agency "${member.agency_name}" is suspended. Please contact platform support.`
        );
      }

      role = member.role; 
      agencyId = member.agency_id;
      contextData = {
        agencyName: member.agency_name,
        jobTitle: member.job_title,
      };
    } else {
      
      const [clientMembers] = await pool.query(
        `SELECT cm.agency_id, cm.client_id, cm.designation, c.company_name, a.name AS agency_name, a.status AS agency_status 
         FROM client_members cm 
         JOIN clients c ON cm.client_id = c.id 
         JOIN agencies a ON cm.agency_id = a.id 
         WHERE cm.user_id = ?`,
        [user.id]
      );

      if (clientMembers.length > 0) {
        const clientUser = clientMembers[0];

        if (clientUser.agency_status === "suspended") {
          throw new ApiError(
            403,
            `Access denied: The agency managing your portal is currently suspended.`
          );
        }

        role = "client";
        agencyId = clientUser.agency_id;
        clientId = clientUser.client_id;
        contextData = {
          companyName: clientUser.company_name,
          designation: clientUser.designation,
          agencyName: clientUser.agency_name,
        };
      }
    }
  }

  // Generating JWT Token
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role,
    agencyId,
    clientId,
  };

  const token = generateToken(tokenPayload);

  
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
          agencyId,
          clientId,
          context: contextData,
        },
        token,
      },
      "Login successful."
    )
  );
});

export const logout = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully."));
});

export const getMe = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User profile retrieved."));
});


export const registerAgency = asynchandler(async (req, res) => {
  const { agency_name, name, email, password } = req.body;

  if (!agency_name || !name || !email || !password) {
    throw new ApiError(400, "Agency name, admin name, email, and password are required.");
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanAgencyName = agency_name.trim();

  
  const [existingUsers] = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [cleanEmail]
  );

  if (existingUsers.length > 0) {
    throw new ApiError(409, "A user with this email address already exists.");
  }


  const [existingAgencies] = await pool.query(
    "SELECT id FROM agencies WHERE LOWER(name) = LOWER(?) OR primary_email = ?",
    [cleanAgencyName, cleanEmail]
  );

  if (existingAgencies.length > 0) {
    throw new ApiError(409, "An agency with this name or email already exists. Please choose a different name.");
  }

  
  const agencyId = "agency-" + crypto.randomUUID().slice(0, 8);
  const baseSlug = cleanAgencyName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const slug = baseSlug + "-" + crypto.randomUUID().slice(0, 4);

  await pool.query(
    `INSERT INTO agencies (id, name, slug, status, plan, primary_email)
     VALUES (?, ?, ?, 'active', 'pro', ?)`,
    [agencyId, cleanAgencyName, slug, cleanEmail]
  );


  const userId = "usr-" + crypto.randomUUID().slice(0, 8);
  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, global_role, is_active)
     VALUES (?, ?, ?, ?, 'user', TRUE)`,
    [userId, name.trim(), cleanEmail, hashedPassword]
  );


  const membershipId = "mem-" + crypto.randomUUID().slice(0, 8);
  await pool.query(
    `INSERT INTO agency_members (id, agency_id, user_id, role, job_title)
     VALUES (?, ?, ?, 'agency_admin', 'Founder')`,
    [membershipId, agencyId, userId]
  );


  const token = generateToken({
    userId,
    email: cleanEmail,
    name: name.trim(),
    role: "agency_admin",
    agencyId,
    clientId: null,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: userId,
          name: name.trim(),
          email: cleanEmail,
          role: "agency_admin",
          agencyId,
          context: {
            agencyName: cleanAgencyName,
            jobTitle: "Founder",
          },
        },
        token,
      },
      "Agency registered successfully. Welcome to your new workspace!"
    )
  );
});
