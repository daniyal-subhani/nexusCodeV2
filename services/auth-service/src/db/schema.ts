import {
  boolean,
  index,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

export const roleEnum = mysqlEnum('role', ['USER', 'ADMIN']);

export const auth = mysqlTable(
  'auth_users',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }),
    role: roleEnum.default('USER').notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    oauthProvider: varchar('oauth_provider', { length: 32 }),
    oauthId: varchar('oauth_id', { length: 128 }),
    isActive: boolean('is_active').default(true).notNull(),
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
  },
  (t) => ({
    emailIdx: index('email_idx').on(t.email),
  }),
);

export const refreshTokens = mysqlTable(
  'refresh_tokens',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => auth.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    familyId: varchar('family_id', { length: 36 }).notNull(),
    deviceInfo: varchar('device_info', { length: 255 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    revoked: boolean('revoked').default(false).notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('user_idx').on(t.userId),
    familyIdx: index('refresh_token_family_idx').on(t.familyId),
  }),
);

export const passwordResets = mysqlTable(
  'password_resets',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => auth.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    used: boolean('used').default(false).notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('password_reset_user_idx').on(t.userId),
    tokenHashIdx: uniqueIndex('password_reset_hash_idx').on(t.tokenHash),
    expiresIdx: index('password_reset_expires_idx').on(t.expiresAt),
  }),
);

export const emailVerifications = mysqlTable(
  'email_verifications',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => auth.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    verified: boolean('verified').default(false).notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('email_verif_user_idx').on(t.userId),
    tokenHashIdx: uniqueIndex('email_verif_hash_idx').on(t.tokenHash),
    expiresIdx: index('email_verif_expires_idx').on(t.expiresAt),
  }),
);
