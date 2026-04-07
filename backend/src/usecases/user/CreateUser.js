// src/usecases/user/CreateUser.js
const userRepository = require('../../infrastructure/repositories/UserRepository');
const { hashPassword } = require('../../infrastructure/utils/auth_helper');

class CreateUser {
  async execute(userData) {
    const { name, email, password, status, avatarUrl } = userData;

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("Email has already been used.");

    const passwordHash = await hashPassword(password || "123456");

    const newUser = await userRepository.create({
      name,
      email: email.trim().toLowerCase(),
      passwordHash,
      status: status || 'active',
      avatarUrl: avatarUrl || null
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      status: newUser.status,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt
    };
  }
}

module.exports = new CreateUser();