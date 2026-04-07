// src/usecases/user/RegisterUser.js
const userRepository = require('../../infrastructure/repositories/UserRepository');
const { hashPassword } = require('../../infrastructure/utils/auth_helper');

class RegisterUser {
  async execute({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("Email đã được sử dụng.");

    const passwordHash = await hashPassword(password);

    const newUser = await userRepository.create({ 
      name, 
      email: email.trim().toLowerCase(), 
      passwordHash,
      status: 'active' 
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      status: newUser.status
    };
  }
}

module.exports = new RegisterUser();