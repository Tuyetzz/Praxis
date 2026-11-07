
class RegisterUser {
  constructor({ userRepository, roleRepository, userRoleRepository, hashPassword }) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.hashPassword = hashPassword;
  }

  async execute({ name, email, password }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error("Email has already been used.");

    const passwordHash = await this.hashPassword(password);

    const newUser = await this.userRepository.create({ 
      name, 
      email: email.trim().toLowerCase(), 
      passwordHash,
      status: 'active' 
    });

    const studentRole = await this.roleRepository.findByName("student");
    if (!studentRole) {
      throw new Error("Default role 'student' not found.");
    }

    await this.userRoleRepository.assignRoleToUser(newUser.id, studentRole.id);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      status: newUser.status
    };
  }
}

module.exports = RegisterUser;