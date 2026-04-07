const userRepository = require('../../infrastructure/repositories/UserRepository');

class GetOneUser {
	async execute(id) {
		if (!id) throw new Error('User id is required');
		return await userRepository.findById(id);
	}
}

module.exports = new GetOneUser();
