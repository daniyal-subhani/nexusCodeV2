import { hashPassword, verifyHash } from '@/config/encrypt';
import { generateAccessToken, generateRefreshToken, hashToken } from '@/config/token';
import { db } from '@/db';
import { auth } from '@/db/schema';
import { refreshTokenRepo } from '@/repository/refreshToken.repository';
import { authRepository } from '@/repository/user.repository';
import { HttpError, UnauthorizedError, ValidationError } from '@nexus/common';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

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
};
