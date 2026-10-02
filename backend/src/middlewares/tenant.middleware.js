import pool from "../config/db.js";
import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";


export const verifyTenant = asynchandler(async (req, res, next) => {
  // Super admin accessing platform-level routes does not require a tenant
  if (req.user?.role === "super_admin" && !req.headers["x-agency-id"]) {
    return next();
  }

  const agencyId = req.headers["x-agency-id"] || req.user?.agencyId;

  if (!agencyId) {
    throw new ApiError(403, "Tenant context required: No agency associated with this session.");
  }

  const [rows] = await pool.query(
    "SELECT id, name, slug, status FROM agencies WHERE id = ?",
    [agencyId]
  );

  if (rows.length === 0) {
    throw new ApiError(404, "Agency workspace not found.");
  }

  const agency = rows[0];

  if (agency.status === "suspended") {
    throw new ApiError(
      403,
      `Access denied: Agency "${agency.name}" is currently suspended. Please contact platform support.`
    );
  }

  req.agency = agency;
  req.agencyId = agency.id;

  next();
});

export default verifyTenant;
