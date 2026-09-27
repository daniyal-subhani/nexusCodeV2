import { generateAccessToken, generateRefreshToken } from '@/config/token';
import { authRepository } from '@/repository/auth.repo';
import { refreshTokenRepo } from '@/repository/refreshToken.repo';
import { HttpError, UnauthorizedError, ValidationError } from '@nexus/common';

export const tokenService = {
  async refreshToken(incommingPlainToken: string) {
    const incomingHash = hashToken(incommingPlainToken);
    const existingTokenRecord = await refreshTokenRepo.findByHash(incomingHash);
    if (!existingTokenRecord) {
      throw new ValidationError('Invalid refresh token');
    }
    if (existingTokenRecord.revoked) {
      await refreshTokenRepo.deleteByFamily(existingTokenRecord.familyId);
      throw new Error('Security Alert: Token reuse detected. All sessions terminated.');
    }
    if (new Date() > existingTokenRecord.expiresAt) {
      await refreshTokenRepo.deleteByHash(incomingHash);
      throw new Error('Refresh Token expired');
    }

    await refreshTokenRepo.deleteByHash(incomingHash);

    const newPlainRefreshToken = generateRefreshToken();
    const newHash = hashToken(newPlainRefreshToken);
    await refreshTokenRepo.create({
      tokenHash: newHash,
      userId: existingTokenRecord.userId,
      familyId: existingTokenRecord.familyId,
      expiresAt: existingTokenRecord.expiresAt,
    });
    const user = await authRepository.findById(existingTokenRecord.userId);
    if (!user || !user.email || !user.role) {
      throw new UnauthorizedError('Unauthorized user');
    }
    const newAccesToken = generateAccessToken({
      sub: existingTokenRecord.userId,
      email: user.email,
      role: user.role,
    });
    return { accessToken: newAccesToken, refreshToken: newPlainRefreshToken };
  },
  rotateRefreshToken: async (userId: string, clientToken: string) => {
    if (!userId || !clientToken || userId.length === 0 || clientToken.length === 0) {
      throw new UnauthorizedError('Invlid userId or token');
    }
    const createClientTokenHash = await hashToken(clientToken);
    if (!createClientTokenHash) throw new Error('Something went wrong!');
    const token = await refreshTokenRepo.findByHash(createClientTokenHash);
    if (!token) {
      throw new HttpError(400, 'Invalid Refresh Token.');
    }
    if (token.used) {
      await refreshTokenRepo.deleteByFamily(token.familyId);
      throw new UnauthorizedError('Token reuse detected - family terminated');
    }
    if (token.revoked) {
      await refreshTokenRepo.deleteByFamily(token.familyId);
      throw new UnauthorizedError('Token revoked');
    }
    if (new Date() > token.expiresAt) {
      throw new UnauthorizedError('Token Expired.');
    }
    await refreshTokenRepo.markUsed(token.id);
    const newRawtoken = generateRefreshToken();
    await refreshTokenRepo.create({
      userId: token.userId,
      familyId: token.familyId,
      tokenHash: hashToken(newRawtoken),
      expiresAt: new Date(Date.now() + 30 * 86400_000),
    });
    const user = await authRepository.findById(token.userId);
    if (!user) {
      throw new HttpError(400, 'User not exists');
    }
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { accessToken, refreshToken: newRawtoken };
  },
  revokeAllForUser() {},
  revokeFamily() {},
};

function hashToken(incommingPlainToken: string) {
  throw new Error('Function not implemented.');
}
