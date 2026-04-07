const userRepository = require('../../infrastructure/repositories/UserRepository');
const sessionRepository = require('../../infrastructure/repositories/AuthSessionRepository');
const roleRepository = require('../../infrastructure/repositories/RoleRepository');
const authHelper = require('../../infrastructure/utils/auth_helper');

class LoginUser {
  async execute(email, password, metadata = {}) {
    const user = await userRepository.findByEmail(email);
    
    if (!user || !user.isActive()) {
      throw new Error("Account not found or is inactive");
    }

    const isMatch = await authHelper.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Email or password is incorrect");
    }

    user.recordLogin(); 

    await userRepository.update(user.id, { lastLoginAt: user.lastLoginAt });
    await roleRepository.loadRolesForUser(user);

    const { accessToken, refreshToken, expiresAt } = authHelper.generateTokens({ 
      id: user.id,
      name: user.name
    });

    await sessionRepository.create({
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
        avatarUrl: user.avatarUrl
      },
      accessToken,
      refreshToken
    };
  }
}

module.exports = new LoginUser();