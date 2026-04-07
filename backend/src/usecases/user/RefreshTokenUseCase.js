const sessionRepository = require('../../infrastructure/repositories/AuthSessionRepository');
const userRepository = require('../../infrastructure/repositories/UserRepository');
const authHelper = require('../../infrastructure/utils/auth_helper');

class RefreshTokenUseCase {
	async execute(refreshToken, metadata = {}) {
		if (!refreshToken) {
			throw new Error('Refresh token is required');
		}

		const session = await sessionRepository.findByRefreshToken(refreshToken);
		if (!session || session.revokedAt || session.expiresAt < new Date()) {
			throw new Error('Invalid or expired refresh token');
		}

		const user = await userRepository.findById(session.userId);
		if (!user || !user.isActive()) {
			throw new Error('User not found or inactive');
		}

		await sessionRepository.revokeToken(refreshToken);

		const { accessToken, refreshToken: newRefreshToken, expiresAt } = authHelper.generateTokens({
			id: user.id,
			name: user.name
		});

		await sessionRepository.create({
			userId: user.id,
			refreshToken: newRefreshToken,
			userAgent: metadata.userAgent || null,
			ip: metadata.ip || null,
			expiresAt: expiresAt
		});

		return {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				avatarUrl: user.avatarUrl
			},
			accessToken,
			refreshToken: newRefreshToken
		};
	}
}

module.exports = new RefreshTokenUseCase();
