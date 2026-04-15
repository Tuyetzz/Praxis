
class RefreshTokenUseCase {
	constructor({ authSessionRepository, userRepository, roleRepository, authHelper }) {
		this.sessionRepository = authSessionRepository;
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.authHelper = authHelper;
	}

	async execute(refreshToken, metadata = {}) {
		if (!refreshToken) {
			throw new Error('Refresh token is required');
		}

		const session = await this.sessionRepository.findByRefreshToken(refreshToken);
		if (!session || session.revokedAt || session.expiresAt < new Date()) {
			throw new Error('Invalid or expired refresh token');
		}

		const user = await this.userRepository.findById(session.userId);
		if (!user || !user.isActive()) {
			throw new Error('User not found or inactive');
		}

		const roles = await this.roleRepository.loadRolesForUser(session.userId);

		const { accessToken, refreshToken: newRefreshToken, expiresAt } = this.authHelper.generateTokens({
			id: user.id,
			name: user.name,
			roles: roles.map(r => r.name)
		});

		// Gợi ý: Nên dùng atomic update theo refreshToken cũ và revokedAt null để tránh race condition
		if (typeof this.sessionRepository.updateByRefreshToken === 'function') {
			await this.sessionRepository.updateByRefreshToken(refreshToken, {
				refreshToken: newRefreshToken,
				expiresAt: expiresAt,
				userAgent: metadata.userAgent || session.userAgent,
				ip: metadata.ip || session.ip
			});
		} else {
			await this.sessionRepository.update(session.id, {
				refreshToken: newRefreshToken, 
				expiresAt: expiresAt,     
				userAgent: metadata.userAgent || session.userAgent,
				ip: metadata.ip || session.ip
			});
		}

		return {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				avatarUrl: user.avatarUrl,
				roles: roles.map(r => r.name)
			},
			accessToken,
			refreshToken: newRefreshToken
		};
	}
}

module.exports = RefreshTokenUseCase;
