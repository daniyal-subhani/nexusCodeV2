import { db } from '@/db';
import { refreshTokens } from '@/db/schema';
import { randomUUID } from 'crypto';
import { and, eq, lt } from 'drizzle-orm';

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
  // token refresh ya verification time
  findByHash: async (tokenHash: string) => {
    return await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, tokenHash),
    });
  },
  // internal service logic - admin control
  deleteById: async (id: string) => {
    await db.delete(refreshTokens).where(eq(refreshTokens.id, id));
  },
  // mannual logout time
  deleteByHash: async (tokenHash: string) => {
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
  },
  // security breach - token theft detection
  deleteByFamily: async (familyId: string) => {
    await db.delete(refreshTokens).where(eq(refreshTokens.familyId, familyId));
  },
  // cleanup function - bg cron job OR automation cleanup
  deletedExpired: async () => {
    await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
  },
  markUsed: async (tokenId: string) => {
    await db
      .update(refreshTokens)
      .set({
        used: true,
        usedAt: new Date(Date.now()),
      })
      .where(eq(refreshTokens.id, tokenId));
  },
  deleteUsedTokensSevenDays: async (timePriod: any) => {
    await db
      .delete(refreshTokens)
      .where(
        and(
          eq(refreshTokens.used, true),
          lt(refreshTokens.usedAt, new Date(Date.now() - timePriod)),
        ),
      );
  },
  deleteUsedTokensThirtyDays: async (timePeriod: any) => {
    await db
      .delete(refreshTokens)
      .where(and(eq(refreshTokens.used, true), lt(refreshTokens.expiresAt, timePeriod)));
  },
};
