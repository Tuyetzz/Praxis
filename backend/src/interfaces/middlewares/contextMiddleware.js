// src/interfaces/middlewares/contextMiddleware.js
const storage = require('../../infrastructure/context/storage');

const contextMiddleware = (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized - No user context" });
  }

  storage.run({ userId }, () => {
    next();
  });
};

module.exports = contextMiddleware;