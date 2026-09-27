import { db } from '@/db';
import { emailVerifications } from '@/db/schema';
import { eq, lt } from 'drizzle-orm';

export const verificationEmailRepository = {
  deleteById: async (verificationId: string) => {
    await db.delete(emailVerifications).where(eq(emailVerifications.id, verificationId));
  },
  deleteExpired: async () => {
    await db.delete(emailVerifications).where(lt(emailVerifications.expiresAt, new Date()));
  },
  create: async (data: { userId: string; tokenHash: string; expiresAt: Date }) => {
    await db.insert(emailVerifications).values({
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    });
  },
  findByHash: async (tokenHash: string) => {
    return await db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.tokenHash, tokenHash),
    });
  },

  deleteByUserId: async (userId: string) => {
    await db.delete(emailVerifications).where(eq(emailVerifications.userId, userId));
  },
};
