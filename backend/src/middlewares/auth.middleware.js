import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { verifyToken } from "../utils/token.util.js";

export const verifyAuth = asynchandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication token missing or invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, email, role, agencyId, clientId }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Session has expired. Please log in again.");
    }
    throw new ApiError(401, "Invalid token.");
  }
});

export default verifyAuth;
