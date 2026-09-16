import { db } from '@/db';
import { passwordResets } from '@/db/schema';
import { lt } from 'drizzle-orm';

export const passwordRepository = {
  deleteUsedResetTokens: async () => {
    await db.delete(passwordResets).where(lt(passwordResets.expiresAt, new Date()));
  },
};
