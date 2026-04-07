const userRepository = require('../../infrastructure/repositories/UserRepository');

class UpdateUser {
  async execute(id, updateData) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error("Could not find user with the provided id.");

    updateData.email = updateData.email ? updateData.email.trim().toLowerCase() : user.email;
    if (updateData.email && updateData.email !== user.email) {
      const existing = await userRepository.findByEmail(updateData.email);
      if (existing) throw new Error("Email exists already in use by another user.");
    }

    return await userRepository.update(id, updateData);
  }
}
module.exports = new UpdateUser();