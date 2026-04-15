
class RegisterUser {
  constructor({ userRepository, hashPassword }) {
    this.userRepository = userRepository;
    this.hashPassword = hashPassword;
  }

  async execute({ name, email, password }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error("Email đã được sử dụng.");

    const passwordHash = await this.hashPassword(password);

    const newUser = await this.userRepository.create({ 
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

module.exports = RegisterUser;