const jwt = require("jsonwebtoken");
const userRepository = require("../../infrastructure/repositories/UserRepository");
const { SUPERADMIN_ROLE_NAME, ALL_PERMISSIONS_FLAG } = require("../../domain/constants/permissions");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  if (!process.env.JWT_ACCESS_SECRET) {
    return res.status(500).json({ message: "JWT secret not configured" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      const isExpired = err.name === "TokenExpiredError";
      return res.status(401).json({ message: isExpired ? "Token expired" : "Invalid token" });
    }
    req.user = { id: decoded.id, role: decoded.role };
    next();
  });
};

module.exports = authMiddleware;

module.exports.requiredRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Missing role" });
  }
  next();
};

module.exports.requiredPermission = (permissionSlug) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (String(req.user.role || "").toLowerCase() === SUPERADMIN_ROLE_NAME) {
      return next();
    }

    const permissionSlugs = await userRepository.getPermissionSlugs(req.user.id);
    const hasPermission =
      permissionSlugs.includes(ALL_PERMISSIONS_FLAG) ||
      permissionSlugs.includes(permissionSlug);

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: Missing permission" });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: "Failed to authorize permission" });
  }
};
