
class CreateUser {
  constructor({ userRepository, hashPassword }) {
    this.userRepository = userRepository;
    this.hashPassword = hashPassword;
  }

  async execute(userData) {
    const { name, email, password, status, avatarUrl } = userData;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error("Email has already been used.");

    const passwordHash = await this.hashPassword(password || "123456");

    const newUser = await this.userRepository.create({
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

module.exports = CreateUser;