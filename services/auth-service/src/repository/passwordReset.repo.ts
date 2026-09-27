import { db } from '@/db';
import { passwordResets } from '@/db/schema';
import { and, desc, eq, gt, lt } from 'drizzle-orm';

export const passwordRepository = {
  findByUserId: async (userId: string) => {
    return await db.query.passwordResets.findFirst({
      where: eq(passwordResets.userId, userId),
      orderBy: desc(passwordResets.createdAt),
    });
  },

  incrementAttempts: async (rowId: string, currentAttempts: number) => {
           await db.update(passwordResets).set({otpAttempts: currentAttempts + 1}).where(eq(passwordResets.id, rowId))
  },

  setResetToken: async (rowId: string, resetTokenHash:string, expiresAt: Date) => {
    await db.update(passwordResets).set({
      resetTokenHash,
      expiresAt: expiresAt
    }).where(
      eq(passwordResets.id, rowId)
    )
  },
  
  

  deleteById: async (passwordResetRowId: string) => {
    await db.delete(passwordResets).where(eq(passwordResets.id, passwordResetRowId));
  },

  findByOtpHash: async (clientOtpHash: string) => {
    return await db.query.passwordResets.findFirst({
      where: and(eq(passwordResets.otpHash, clientOtpHash)),
    });
  },
  createOtp: async (data: {
    userId: string;
    otpHash: string;
    duration: Date;
    resetTokenHash: string;
  }) => {
    await db.insert(passwordResets).values({
      userId: data.userId,
      otpHash: data.otpHash,
      resetTokenHash: data.resetTokenHash,
      expiresAt: data.duration,
    });
  },

  resetPassword: async (data: { userId: string; expiresAt: Date }) => {
    db.insert(passwordResets).values({
      id: crypto.randomUUID(),
      userId: data.userId,
      expiresAt: data.expiresAt,
      

    });
  },
  findValidByHash: async (clientTokenHash: string) => {
    return await db.query.passwordResets.findFirst({
      where: and(
        eq(passwordResets.resetTokenHash, clientTokenHash),
        eq(passwordResets.used, false),
        gt(passwordResets.expiresAt, new Date()),
      ),
    });
  },
  markResetTokenUsed: async (rowId: string) => {
    await db
      .update(passwordResets)
      .set({
        used: true,
      })
      .where(eq(passwordResets.id, rowId));
  },

  deleteAllForUser: async (userId: string) => {
    await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
  },

  deleteExpired: async () => {
    await db.delete(passwordResets).where(lt(passwordResets.expiresAt, new Date()));
  },

  verifyUserOtp: async (data: {
    userId: string;
    rowId: string;
    verified: boolean;
    otpUsed: boolean;
    attempts: number;
  }) => {
    const result = await db
      .update(passwordResets)
      .set({
        otpAttempts: data.attempts,
        otpVerified: data.verified,
        used: data.otpUsed,
      })
      .where(and(eq(passwordResets.id, data.rowId), eq(passwordResets.userId, data.userId)));
    return result;
  },
};
