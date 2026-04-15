
class GetOneUser {
	constructor({ userRepository }) {
		this.userRepository = userRepository;
	}

	async execute(id) {
		if (!id) throw new Error('User id is required');
		return await this.userRepository.findById(id);
	}
}

module.exports = GetOneUser;
