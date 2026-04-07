const userRepository = require('../../infrastructure/repositories/UserRepository');

class DeleteUser {
  async execute(id) {
    return await userRepository.softDelete(id);
  }
}
module.exports = new DeleteUser();