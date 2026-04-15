
class UpdateUser {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(id, updateData) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("Could not find user with the provided id.");

    updateData.email = updateData.email ? updateData.email.trim().toLowerCase() : user.email;
    if (updateData.email && updateData.email !== user.email) {
      const existing = await this.userRepository.findByEmail(updateData.email);
      if (existing) throw new Error("Email exists already in use by another user.");
    }

    return await this.userRepository.update(id, updateData);
  }
}
module.exports = UpdateUser;