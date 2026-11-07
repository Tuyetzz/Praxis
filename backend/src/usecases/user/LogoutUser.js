
class LogoutUser {
  constructor({ authSessionRepository }) {
    this.sessionRepository = authSessionRepository;
  }

  async execute(refreshToken) {
    if (!refreshToken) {
      throw new Error("RefreshToken is required to logout.");
    }

    const session = await this.sessionRepository.findByRefreshToken(refreshToken);

    if (!session || session.revokedAt) {
      return { success: true, message: "Session already invalidated" };
    }

    await this.sessionRepository.revokeToken(refreshToken);

    return { success: true, message: "Logged out successfully" };
  }
}

module.exports = LogoutUser;