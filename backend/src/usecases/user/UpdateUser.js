const userRepository = require('../../infrastructure/repositories/UserRepository');

class UpdateUser {
  async execute(id, updateData) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error("Không tìm thấy người dùng");

    if (updateData.email && updateData.email !== user.email) {
      const existing = await userRepository.findByEmail(updateData.email);
      if (existing) throw new Error("Email đã tồn tại");
    }

    return await userRepository.update(id, updateData);
  }
}
module.exports = new UpdateUser();