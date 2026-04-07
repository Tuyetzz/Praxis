const userRepository = require('../../infrastructure/repositories/UserRepository');

class GetUsers {
  async execute(filters = {}) {
    return await userRepository.findAll(filters);
  }
}
module.exports = new GetUsers();