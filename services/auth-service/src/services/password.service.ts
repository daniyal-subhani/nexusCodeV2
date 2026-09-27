import { hashPassword, verifyHash } from '@/config/encrypt';
import { generateAccessToken, hashToken } from '@/config/token';
import { passwordRepository } from '@/repository/passwordReset.repo';
import { refreshTokenRepo } from '@/repository/refreshToken.repo';
import { authRepository } from '@/repository/auth.repo';
import { logger } from '@/utils/logger';
import { sendVerificationOTP } from '@/utils/sendOtp';
import { BadRequestError, NotFoundError, UnauthorizedError, ValidationError } from '@nexus/common';
import crypto from 'crypto';
import { db } from '@/db';
import { auth } from '@/db/schema';
import { eq } from 'drizzle-orm';

 const OTP_TTL_MS = 10 * 60 * 1000;
    const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
    const MAX_OTP_ATTEMPTS = 5;


export const passwordService = {
  setNewPassword: async (data: { userId: string; oldPassword: string; newPassword: string }) => {
    const user = await authRepository.findById(data.userId);
    if (!user || user.isActive === false || !user.passwordHash) {
      throw new UnauthorizedError('Invalid Credientials');
    }
    const passwordVerify = await verifyHash(user.passwordHash, data.oldPassword);
    if (!passwordVerify) throw new UnauthorizedError('invalid Credientials');
    const newHashPassword = await hashPassword(data.newPassword);
    const updatePassword = await passwordRepository.setNewPassword({
      userId: user.id,
      oldPasswordHash: user.passwordHash,
      newPasswordHash: newHashPassword,
    });
    return { updatePassword };
  },

  forgotPassword: async (email: string) => {
    if (!email || !email.includes('@')) {
      throw new ValidationError('Valid email required');
    }
    const user = await authRepository.findByEmail(email);
    if (!user || !user.isActive) {
      return;
    }
    await passwordRepository.deleteAllForUser(user.id);

    const otp = String(crypto.randomInt(100000, 999999));
    const otpHash = hashToken(otp);
    const newResetToken = String(crypto.randomBytes(32))

    await passwordRepository.createOtp({
      userId: user.id,
      otpHash: otpHash,
      duration: new Date(Date.now() + OTP_TTL_MS),
      resetTokenHash: newResetToken
    })

    await sendVerificationOTP(user.email, otp)
    logger.info("OTP send to user")
  },
  verifyOtp: async (email: string, otp: string) => {
    if (!email || !otp) {
      throw new ValidationError('Email and OTP required');
    }
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }
    const otpHash = hashToken(otp);
    const row = await passwordRepository.findByOtpHash(otpHash);
    if (!row) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }
    // Attempts check
    if (row.otpAttempts >= MAX_OTP_ATTEMPTS) {
      await passwordRepository.deleteById(row.id);
      throw new UnauthorizedError('Too many attempts. Request new OTP');
    }
    // Expiry check
    if (row.expiresAt < new Date()) {
      await passwordRepository.deleteById(row.id);
      throw new UnauthorizedError('OTP expired');
    }
    if (row.otpVerified) {
      throw new BadRequestError('OTP already used');
    }
    const userAttempts = row.otpAttempts +1;
    const otpVerifiedUser =  await passwordRepository.verifyUserOtp({
      rowId: row.id,
      userId: user.id,
      otpUsed: true,
      verified: true,
      attempts: userAttempts,
    })
    if(!otpVerifiedUser) {
      throw new Error("Something went wrong")
    }
  if(row.family) {

    await refreshTokenRepo.deleteByFamily(row.)
  }
  },
    async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    if (!userId || !oldPassword || !newPassword) {
      throw new ValidationError('All fields required');
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
    await refreshTokenRepo.deleteByUserId(userId)
    return { message: "Password updated" };
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
};
