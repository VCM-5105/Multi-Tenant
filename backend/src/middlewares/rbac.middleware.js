import { ApiError } from "../utils/apiError.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role "${req.user?.role || "anonymous"}" is not authorized for this resource.`
        )
      );
    }
    next();
  };
};

export default authorizeRoles;
