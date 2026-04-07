// src/usecases/auth/LogoutUser.js
const sessionRepository = require('../../infrastructure/repositories/AuthSessionRepository');

class LogoutUser {
  async execute(refreshToken) {
    if (!refreshToken) {
      throw new Error("RefreshToken is required to logout.");
    }

    const session = await sessionRepository.findByRefreshToken(refreshToken);
    
    if (!session || session.revokedAt) {
      return { success: true, message: "Session already invalidated" };
    }

    await sessionRepository.revokeToken(refreshToken);

    return { success: true, message: "Logged out successfully" };
  }
}

module.exports = new LogoutUser();