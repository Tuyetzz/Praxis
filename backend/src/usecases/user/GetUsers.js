
class GetUsers {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(filters = {}) {
    if (this.userRepository.findAllWithRoles) {
      return await this.userRepository.findAllWithRoles(filters);
    }
    return await this.userRepository.findAll(filters);
  }
}
module.exports = GetUsers;