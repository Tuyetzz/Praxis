const jwt = require("jsonwebtoken");
const { SUPERADMIN_ROLE_NAME, ALL_PERMISSIONS_FLAG } = require("../../domain/constants/permissions");

function createAuthMiddleware({ userRepository, redisClient }) {
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

  authMiddleware.requiredRole = (...roles) => (req, res, next) => {
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

  authMiddleware.requiredPermission = (permissionSlug) => async (req, res, next) => {
    try {
      console.log("requiredPermission called with slug:", permissionSlug);
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      console.log("Checking permission for user:", req.user.id, "Permission:", permissionSlug);
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

  return authMiddleware;
}

module.exports = createAuthMiddleware;
