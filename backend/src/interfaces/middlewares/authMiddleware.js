const jwt = require("jsonwebtoken");
const userRepository = require("../../infrastructure/repositories/UserRepository");
const redisClient = require("../../infrastructure/cache/redisClient");
const { SUPERADMIN_ROLE_NAME, ALL_PERMISSIONS_FLAG } = require("../../domain/constants/permissions");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  if (!process.env.JWT_ACCESS_SECRET) {
    return res.status(500).json({ message: "JWT_ACCESS_SECRET not configured" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      const isExpired = err.name === "TokenExpiredError";
      return res.status(401).json({ message: isExpired ? "Token expired" : "Invalid token" });
    }
    req.user = { id: decoded.id, roles: decoded.roles || (decoded.role ? [decoded.role] : []) };
    next();
  });
};

module.exports = authMiddleware;

module.exports.requiredRole = (...roles) => (req, res, next) => {
  if (!req.user || !req.user.roles) {
    return res.status(403).json({ message: "Forbidden: Missing role" });
  }
  const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
  const hasRole = userRoles.some(userRole => roles.includes(userRole));
  if (!hasRole) {
    return res.status(403).json({ message: "Forbidden: Missing role" });
  }
  next();
};

module.exports.requiredPermission = (permissionSlug) => async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];

    const isSuperAdmin = userRoles.some(
      (role) => String(role).toLowerCase() === SUPERADMIN_ROLE_NAME.toLowerCase()
    );
    if (isSuperAdmin) return next();

    const cacheKey = `user_permissions:${userId}`;
    let cachedData = await redisClient.get(cacheKey);
    let permissionSlugs;

    if (!cachedData) {
      permissionSlugs = await userRepository.getPermissionSlugs(userId);
      await redisClient.set(cacheKey, JSON.stringify(permissionSlugs), 'EX', 600);
    } else {
      permissionSlugs = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
    }

    const hasPermission =
      permissionSlugs.includes(ALL_PERMISSIONS_FLAG) ||
      permissionSlugs.includes(permissionSlug);

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: Missing permission" });
    }

    return next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(500).json({ message: "Internal Server Error during authorization" });
  }
};
