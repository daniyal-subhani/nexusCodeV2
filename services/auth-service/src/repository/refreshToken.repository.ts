import { db } from '@/db';
import { refreshTokens } from '@/db/schema';
import { randomUUID } from 'crypto';
import { eq, lt } from 'drizzle-orm';

export const refreshTokenRepo = {
  create: async (data: {
    tokenHash: string;
    userId: string;
    familyId: string;
    expiresAt: Date;
  }) => {
    await db.insert(refreshTokens).values({
      id: randomUUID(),
      ...data,
    });
  },
  findByHash: async (tokenHash: string) => {
    await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, tokenHash),
    });
  },
  deleteById: async (id: string) => {
    await db.delete(refreshTokens).where(eq(refreshTokens.id, id));
  },
  deleteByHash: async (tokenHash: string) => {
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
  },
  deleteByFamily: async (familyId: string) => {
    await db.delete(refreshTokens).where(eq(refreshTokens.familyId, familyId));
  },
  deletedExpired: async () => {
    await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
  },
};
