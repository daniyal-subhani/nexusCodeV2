import { hashPassword, verifyHash } from '@/config/encrypt';
import { generateAccessToken, generateRefreshToken, hashToken } from '@/config/token';
import { db } from '@/db';
import { auth, emailVerifications } from '@/db/schema';
import { refreshTokenRepo } from '@/repository/refreshToken.repository';
import { authRepository } from '@/repository/user.repository';
import { verificationEmailRepository } from '@/repository/verificationEmail.repository';
import { sendVerificationEmail } from '@/utils/mailer';
import { HttpError, NotFoundError, UnauthorizedError, ValidationError } from '@nexus/common';
import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const authService = {
  async signup(email: string, password: string) {
    if (!email || isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }
    const existing = await authRepository.findByEmail(email);
    if (existing) throw new HttpError(409, 'Email Already Exists.');
    const passwordHash = await hashPassword(password);
    const user = await authRepository.create({ email, passwordHash, role: 'USER' });

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const rawRefresh = generateRefreshToken();
    await refreshTokenRepo.create({
      userId: user.id,
      familyId: randomUUID(),
      tokenHash: hashToken(rawRefresh),
      expiresAt: new Date(Date.now() + 30 * 86400_000),
    });
    // event

    // verification
    await sendVerificationEmail(user.email, rawRefresh);

    return { accessToken, refreshToken: rawRefresh, user };
  },
  async login(email: string, password: string) {
    if (!email || !email.includes('@')) {
      throw new ValidationError('Invalid Credientials');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be 8 characters long');
    }
    const user = await db.query.auth.findFirst({ where: eq(auth.email, email) });
    if (!user) {
      throw new UnauthorizedError('Invalid Credientials');
    }
    const ok = await verifyHash(user.passwordHash ?? '', password);
    if (!ok) {
      throw new UnauthorizedError('Invalid Credientials');
    }
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const rawRefresh = generateRefreshToken();
    await refreshTokenRepo.create({
      userId: user.id,
      tokenHash: hashToken(rawRefresh),
      familyId: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 30 * 86400_000),
    });
    return { accessToken, refreshToken: rawRefresh, user };
  },
  async logout(id: string, res: any) {
    if (!id) {
      throw new UnauthorizedError('Invalid Credientials');
    }
    await authRepository.logout(id);
    res.clearCookies('Cookies cleared!');
  },
  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    if (!userId || !oldPassword || !newPassword) {
      throw new UnauthorizedError('Invalid Credientials');
    }
    const user = await db.query.auth.findFirst({ where: eq(auth.id, userId) });
    if (!user || !user.passwordHash) {
      throw new NotFoundError('Invalid credentials');
    }
    const comparePassword = await verifyHash(user?.passwordHash ?? '', oldPassword);
    if (!comparePassword) {
      throw new ValidationError('Invalid Credientials');
    }
    const newHash = await hashPassword(newPassword);
    await authRepository.updatePassword(userId, newHash);
    return { user };
  },
  async resetPassword(userId: string, email: string) {
    if (!userId || !email || !email.includes('@')) {
      throw new UnauthorizedError('Invalid Credientials!');
    }
    const user = await db.query.auth.findFirst({
      where: and(eq(auth.id, userId), eq(auth.email, email)),
    });
    if (!user || !user.id || !user.email) {
      throw new UnauthorizedError('Invalid Credientials!');
    }
    // const sendVerification = await authRepository.resetPassword(userId, email);
    // const setNewPassword = await authRepository.setNewPassword(userId);
  },
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
  async verifyEmailHandler(token: string) {
    if (!token) {
      throw new HttpError(400, 'Something went wrong');
    }
    const incomingHash = hashToken(token);
    const verificationRecord = await db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.tokenHash, incomingHash),
    });
    if (!verificationRecord) {
      throw new UnauthorizedError('Invalid verification token!');
    }
    if (new Date() > verificationRecord.expiresAt) {
      throw new UnauthorizedError('Verification token expired.');
    }
    await verificationEmailRepository.verifiedUserEmail(verificationRecord.userId);
    await verificationEmailRepository.deleteVerificationTokenById(verificationRecord.id);
    return { message: 'Email successfully verified!' };
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
      expiresAt: new Date(Date.now() * 30 * 86400_000),
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
};
