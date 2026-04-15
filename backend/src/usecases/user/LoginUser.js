
class LoginUser {
  constructor({ userRepository, authSessionRepository, roleRepository, authHelper }) {
    this.userRepository = userRepository;
    this.sessionRepository = authSessionRepository;
    this.roleRepository = roleRepository;
    this.authHelper = authHelper;
  }

  async execute(email, password, metadata = {}) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.isActive()) {
      throw new Error("Account not found or is inactive");
    }

    const isMatch = await this.authHelper.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Email or password is incorrect");
    }

    user.recordLogin();

    const userId = typeof user.id === 'object' ? user.id.value : user.id;
    await this.userRepository.update(userId, {
      lastLoginAt: user.lastLoginAt
    });

    const roles = await this.roleRepository.loadRolesForUser(userId);

    const { accessToken, refreshToken, expiresAt } = this.authHelper.generateTokens({
      id: user.id,
      name: user.name,
      roles: roles.map(r => r.name)
    });

    await this.sessionRepository.create({
      userId: user.id,
      refreshToken: refreshToken,
      userAgent: metadata.userAgent || null,
      ip: metadata.ip || null,
      expiresAt: expiresAt
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        roles: roles.map(r => r.name)
      },
      accessToken,
      refreshToken
    };
  }
}

module.exports = LoginUser;