import { db } from '@/db';
import { auth } from '@/db/schema';
import { UserRole } from '@/types/user.types';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

export const authRepository = {
  findByEmail: async (email: string) =>
    await db.query.auth.findFirst({
      where: eq(auth.email, email),
    }),
  findById: async (userId: string) => {
    await db.query.auth.findFirst({
      where: eq(auth.id, userId),
    });
  },
  create: async (data: { email: string; passwordHash: string; role?: UserRole }) => {
    const [user] = await db
      .insert(auth)
      .values({
        id: randomUUID(),
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? 'USER',
      })
      .$returningId();
    return {
      id: user.id,
      email: data.email,
      role: data.role ?? 'USER',
    };
  },
  setEmailVarified: async (userId: string) => {
    await db
      .update(auth)
      .set({
        emailVerified: true,
      })
      .where(eq(auth.id, userId));
  },
};
