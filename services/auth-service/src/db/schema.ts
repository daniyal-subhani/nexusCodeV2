import { boolean, mysqlEnum, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const roleEnum = mysqlEnum('role', ['USER', 'ADMIN']);

export const auth = mysqlTable('auth_users', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 512 }),
  role: roleEnum.default('USER').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),

  provider: varchar('provider', { length: 50 }).default('credentials').notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }),

  createdAt: timestamp('created_at', {
    mode: 'date',
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'date',
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
