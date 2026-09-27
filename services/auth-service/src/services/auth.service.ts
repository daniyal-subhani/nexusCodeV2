import { hashPassword, verifyHash } from '@/config/encrypt';
import { generateAccessToken, generateRefreshToken, hashToken } from '@/config/token';
import { db } from '@/db';
import { auth } from '@/db/schema';
import { publishUserCreated } from '@/events/publishers/user-created.publisher';
import { authRepository } from '@/repository/auth.repo';
import { verificationEmailRepository } from '@/repository/emailVerification.repo';
import { refreshTokenRepo } from '@/repository/refreshToken.repo';
import { sendVerificationEmail } from '@/utils/mailer';
import { HttpError, UnauthorizedError, ValidationError } from '@nexus/common';
import crypto, { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const authService = {
  async signup(email: string, password: string) {
    if (!email || !isValidEmail(email)) {
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
      familyId: crypto.randomUUID(),
      tokenHash: hashToken(rawRefresh),
      expiresAt: new Date(Date.now() + 30 * 86400_000),
    });
    // event
    await publishUserCreated({
      userId: user.id,
      email: user.email
    })
    // verification
    const rawVerification = crypto.randomBytes(32).toString('hex');
    await verificationEmailRepository.create({
      userId: user.id,
      tokenHash: hashToken(rawVerification),
      expiresAt: new Date(Date.now() + 24 * 3600_000),
    });
    await sendVerificationEmail(user.email, rawVerification);

    return {
      accessToken,
      refreshToken: rawRefresh,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        verified: user.isVerified,
      },
    };
  },
  async login(email: string, password: string) {
    if (!email || !email.includes('@')) {
      throw new ValidationError('Invalid Credientials');
    }
    if (!password || password.length === 0) {
      throw new ValidationError('Invalid credientials');
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
      familyId: randomUUID(),
      expiresAt: new Date(Date.now() + 30 * 86400_000),
    });
    return { accessToken, refreshToken: rawRefresh, user };
  },
  async logout(userId: string, refreshToken: string) {
    const hash = hashToken(refreshToken);
    const token = await refreshTokenRepo.findByHash(hash);
    if (!token || token.userId !== userId) {
      throw new UnauthorizedError('Invalid token');
    }
    await refreshTokenRepo.deleteByHash(hash);
  },
};
