
class DeleteUser {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(id) {
    return await this.userRepository.softDelete(id);
  }
}
module.exports = DeleteUser;