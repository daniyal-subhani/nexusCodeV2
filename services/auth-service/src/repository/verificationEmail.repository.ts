import { db } from '@/db';
import { auth, emailVerifications } from '@/db/schema';
import { UnauthorizedError } from '@nexus/common';
import { eq, lt } from 'drizzle-orm';

export const verificationEmailRepository = {
  findById: async (verificationId: string) => {
    return await db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.id, verificationId),
    });
  },
  verifiedUserEmail: async (userId: string) => {
    if (!userId || userId.length === 0) {
      throw new UnauthorizedError('Invalid Credientials');
    }
    await db
      .update(auth)
      .set({
        emailVerified: true,
      })
      .where(eq(auth.id, userId));
  },
  deleteVerificationTokenById: async (verificationId: string) => {
    if (!verificationId || verificationId.length === 0) {
      throw new UnauthorizedError('Invalid Credientials');
    }
    await db.delete(emailVerifications).where(eq(emailVerifications.id, verificationId));
  },
  deleteExpireEmailVerifications: async () => {
    await db.delete(emailVerifications).where(lt(emailVerifications.expiresAt, new Date()));
  },
};
