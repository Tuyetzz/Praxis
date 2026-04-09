const sessionRepository = require('../../infrastructure/repositories/AuthSessionRepository');
const userRepository = require('../../infrastructure/repositories/UserRepository');
const roleRepository = require('../../infrastructure/repositories/RoleRepository');
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

		const roles = await roleRepository.loadRolesForUser(session.userId);

		const { accessToken, refreshToken: newRefreshToken, expiresAt } = authHelper.generateTokens({
			id: user.id,
			name: user.name,
			roles: roles.map(r => r.name)
		});

		// Gợi ý: Nên dùng atomic update theo refreshToken cũ và revokedAt null để tránh race condition
		if (typeof sessionRepository.updateByRefreshToken === 'function') {
			await sessionRepository.updateByRefreshToken(refreshToken, {
				refreshToken: newRefreshToken,
				expiresAt: expiresAt,
				userAgent: metadata.userAgent || session.userAgent,
				ip: metadata.ip || session.ip
			});
		} else {
			await sessionRepository.update(session.id, {
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

module.exports = new RefreshTokenUseCase();
