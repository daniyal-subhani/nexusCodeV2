# Nexus Core V2 — Auth Service Complete Reference

> All-in-one notes: Microservices, Drizzle ORM, MySQL, JWT, RabbitMQ, Docker
> Last updated: 2026-09-13

---

# Table of Contents

1. [Big Picture — Microservices](#1-big-picture)
2. [Auth Tokens — Access vs Refresh](#2-auth-tokens)
3. [JWT — Payload, Issuer, Audience](#3-jwt)
4. [Refresh Token — Opaque + Hashed](#4-refresh-token)
5. [familyId — Replay Attack Detection](#5-familyid)
6. [Logout & Expiry Behavior](#6-logout--expiry)
7. [Drizzle Commands — generate, migrate, push](#7-drizzle-commands)
8. [Drizzle Schema — Rules & Best Practices](#8-drizzle-schema)
9. [Layered Architecture](#9-layered-architecture)
10. [RabbitMQ Events](#10-rabbitmq-events)
11. [Docker + Adminer + MySQL](#11-docker--adminer--mysql)
12. [Complete Auth Schema](#12-complete-auth-schema)
13. [Common Errors & Fixes](#13-common-errors--fixes)
14. [Code Writing Order](#14-code-writing-order)
15. [Quick Cheat Sheet](#15-quick-cheat-sheet)
16. [Do's and Don'ts](#16-dos-and-donts)

---

# 1. Big Picture

## 1.1 Microservices Architecture

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Auth Service │ │ User Service │ │ Email Service │
│ │ │ │ │ │
│ - signup │ │ - profile │ │ - welcome mail │
│ - login │ │ - avatar │ │ - verify mail │
│ - tokens │ │ - bio │ │ │
│ - logout │ │ │ │ │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
│ │ │
└───────────┬───────────┴───────────────────────┘
│
┌──────▼──────┐
│ RabbitMQ │
│ (events) │
└─────────────┘

text

## 1.2 Auth Service ka Kaam

Sirf 4 cheezein:

1. **Signup** — user banao + tokens + `user.created` event
2. **Login** — credentials check, tokens do
3. **Refresh** — naya access token do
4. **Logout** — refresh token delete

**Baaki kuch nahi.** Profile, avatar, bio, mail — ye User/Email service ka kaam.

## 1.3 Har Service ki Apni DB

- Auth service ki apni DB (`auth_users`, `refresh_tokens`)
- User service ki apni DB (`profiles`)
- Dono alag, dono alag deploy, dono apna kaam
- Dono ke beech RabbitMQ

## 1.4 Signup Flow

Client → Auth Service: POST /auth/signup { email, password }

Auth Service:

email check karo (already exists?)

password hash karo

user banao (sirf id, email, passwordHash, role)

access + refresh token banao

response bhejo client ko

Auth Service → RabbitMQ: publish "user.created" { userId, email }

User Service ← RabbitMQ: event suna

apni DB mein profile row banao

Email Service ← RabbitMQ: event suna

welcome email bhejo

text

## 1.5 Kyun Microservices (Isolation)

| Problem                                | Solution                           |
| -------------------------------------- | ---------------------------------- |
| Auth service down → poora system down? | Nahi, RabbitMQ buffer              |
| User service down → signup fail?       | Nahi, event queue mein             |
| Ek service change                      | Dusri services ko farak nahi       |
| Scale karna                            | Sirf ek service ka instance badhao |

---

# 2. Auth Tokens

## 2.1 Do Tokens Kyun

**Ek token se problem:**

- 30 din ka token rakho → chor 30 din tak ghusa rahega, logout kaam nahi karega
- 15 min ka rakho → user ko har 15 min mein login karna padega

**Solution:** Do tokens — ek chhota, ek lamba.

## 2.2 Comparison

|                  | Access Token                           | Refresh Token                          |
| ---------------- | -------------------------------------- | -------------------------------------- |
| Format           | JWT (signed)                           | Opaque random string                   |
| Lifetime         | 15 min                                 | 30 din                                 |
| Kahan bhejta hai | Har API request (Authorization header) | Sirf `/auth/refresh` (httpOnly cookie) |
| Server pe kahan  | Kuch nahi (stateless)                  | DB mein SHA-256 hash                   |
| Verify           | Signature                              | DB lookup                              |
| Revoke ho sakta? | Nahi (short-lived, accepted)           | Haan (DB se delete)                    |
| DB load          | Nahi                                   | Sirf refresh pe                        |

## 2.3 Analogy

- **Access token** = 15 minute ki parking ticket
- **Refresh token** = mahine ka parking pass

Ticket expire ho gayi? Pass dikhao, nayi ticket lo. Pass expire? Naya pass lo (login).

## 2.4 Dono Kab Verify Hote Hain

**Normal API call (har request):**
GET /posts
Authorization: Bearer <accessToken>

Server: sirf accessToken verify karo (JWT signature)
refresh token ko dekho bhi nahi

text

**Refresh endpoint (har 15 min mein ek baar):**
POST /auth/refresh
Cookie: refresh_token=<rawToken>

Server: sirf refresh token verify karo (DB lookup)
access token ko dekho bhi nahi

text

**Dono kabhi ek saath verify nahi hote.**

## 2.5 Purana vs Naya Approach

**Purana (dono JWT):**
access_token = JWT (15 min)
refresh_token = JWT (30 din) ← revoke nahi ho sakta

text

**Problem:** Logout kaam nahi karta. Chor 30 din tak ghusa rahega.

**Naya (recommended):**
access_token = JWT (15 min) ← stateless, fast
refresh_token = opaque random + DB hash ← revocable, safe

text

**Yahi industry standard** — Auth0, Okta, Google, GitHub sab yahi karte hain.

## 2.6 Token Blacklist (Optional)

Agar 100% instant logout chahiye har jagah:
Logout pe → access token ka jti blacklist table mein
Har API call → check blacklist?

text

**Lekin** isse JWT ka stateless fayda khatam (har request pe DB hit). 99% apps ye nahi karte — short access token hi kaafi hai.

---

# 3. JWT

## 3.1 Access Token Generation

```
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

const ACCESS_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET as string;

if (!ACCESS_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not set');
}

const ACCESS_OPTIONS: SignOptions = {
  expiresIn: process.env.ACCESS_EXPIRE as SignOptions['expiresIn'],
  issuer: 'nexusCoreV2',
  audience: 'nexusCoreV2-api',
};

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, ACCESS_OPTIONS);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, ACCESS_SECRET, {
    issuer: 'nexusCoreV2',
    audience: 'nexusCoreV2-api',
  }) as AccessTokenPayload;
};
3.2 Payload Types

// src/types/jwt.types.ts
export type UserRole = 'USER' | 'ADMIN';

export type AccessTokenPayload = {
  sub: string;      // user id
  role: UserRole;
};
3.3 issuer Kya Hai
"Ye token kisne banaya?"


issuer: 'nexusCoreV2'
Matlab: "Ye token nexusCoreV2 system ne issue kiya hai."

3.4 audience Kya Hai
"Ye token kiske liye valid hai?"

ts
audience: 'nexusCoreV2-api'
Matlab: "Ye token nexusCoreV2-api ke liye valid hai."

3.5 Kyun Zaroori (Microservices)
Socho 2 systems:

text
nexusCoreV2 (tumhara)   — secret S1
someOtherApp            — secret S1 (by mistake same)
Agar iss/aud check nahi karo → kisi aur app ka token tumhare system mein valid lagega. Security hole.

iss/aud check karne se:

text
Token aaya → iss "someOtherApp" → mismatch → reject ✅
3.6 Chitthi Analogy
text
From: NexusCoreV2       ← issuer
To:   Auth Service      ← audience
Chitthi pe ye 2 line likhna = JWT mein iss aur aud.

3.7 Audience Approaches
Approach A: Har service ka apna audience

ts
jwt.sign(payload, SECRET, {
  issuer: 'nexusCoreV2',
  audience: ['user-service', 'payment-service', 'auth-service'],
});

// Har service apne audience se verify kare
jwt.verify(token, SECRET, {
  issuer: 'nexusCoreV2',
  audience: 'user-service',
});
Approach B: Common audience (recommended, simple)

ts
jwt.sign(payload, SECRET, {
  issuer: 'nexusCoreV2',
  audience: 'nexusCoreV2-api',
});

// Sab services isi se verify karti hain
3.8 Secret Generate Karna
bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
.env:

env
ACCESS_TOKEN_SECRET=some-long-random-string-min-32-chars
ACCESS_EXPIRE=15m
3.9 Auth Middleware
ts
// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt.util';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
4. Refresh Token
4.1 Utils
ts
// src/utils/token.util.ts
import crypto from 'crypto';

const REFRESH_TOKEN_BYTES = 32; // 256 bits entropy

/**
 * Random opaque refresh token — client ko jayega.
 */
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
};

/**
 * SHA-256 hash — DB mein store hoga.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
Note: hashToken mein salt nahi lagana. Refresh token already 256-bit random hai — brute-force impossible. Salt se DB lookup mushkil ho jayega.

4.2 Generate + Store Flow
ts
// 1. Login pe
const rawToken  = generateRefreshToken();  // "7f3a9b..." — client ko
const tokenHash = hashToken(rawToken);     // "a4d2e1..." — DB mein

await db.insert(refreshTokens).values({
  tokenHash,
  userId,
  familyId,
  expiresAt,
});

res.cookie('refresh_token', rawToken, ...);
text
DB mein:      tokenHash (a4d2e1...)
Client pe:    rawToken (7f3a9b...)
4.3 Verify (Refresh Endpoint)
ts
const incoming = req.cookies.refresh_token;   // raw
const incomingHash = hashToken(incoming);     // hash banao

const row = await refreshTokenRepo.findByHash(incomingHash);

if (!row) return res.status(401);   // DB mein nahi mila
4.4 Kyun Hash Karte Hain
DB leak ho gaya → attacker ko sirf hash milta hai, asli token nahi

Hash se token mint nahi kar sakta (SHA-256 one-way)

Client ko raw diya → client ke paas asli token

Verify ke waqt → client ka raw hash karo, DB ke hash se compare karo

4.5 Token Validation Rules
Situation	Result
Client token bhejta hai, DB mein hai	✅ Valid
Client token bhejta hai, DB mein nahi	❌ 401
DB mein hai lekin expire ho gaya	❌ 401
Chor ke paas token, DB se delete	❌ 401
DB leak, attacker ke paas hash	❌ Hash se token nahi ban sakta
Rule: Token ka hona kaafi nahi. DB mein hona zaroori hai. DB hi asli authority hai.

4.6 Rotation — Purana Delete, Naya Banao
ts
async rotateRefreshToken(rawRefresh: string) {
  const tokenHash = hashToken(rawRefresh);
  const row = await refreshTokenRepo.findByHash(tokenHash);

  if (!row) throw new AppError('Invalid refresh token', 401);

  if (row.expiresAt < new Date()) {
    await refreshTokenRepo.deleteById(row.id);
    throw new AppError('Refresh token expired', 401);
  }

  // Rotation: purana delete, naya banao with SAME familyId
  const newRaw = generateRefreshToken();
  await refreshTokenRepo.deleteById(row.id);
  await refreshTokenRepo.create({
    tokenHash: hashToken(newRaw),
    userId: row.userId,
    familyId: row.familyId,        // same family
    expiresAt: new Date(Date.now() + 30 * 86400_000),
  });

  const accessToken = generateAccessToken({
    sub: row.user.id,
    role: row.user.role,
  });

  return { accessToken, refreshToken: newRaw };
}
4.7 Cookie Options
ts
const COOKIE_OPTS = {
  httpOnly: true,                                 // JS se access nahi (XSS safe)
  secure: process.env.NODE_ENV === 'production',  // HTTPS only
  sameSite: 'strict' as const,                    // CSRF protection
  path: '/auth',                                  // sirf auth endpoints
  maxAge: 30 * 24 * 60 * 60 * 1000,               // 30 din
};
Important: Refresh token ko kabhi JSON response mein mat bhejo — sirf cookie mein. Warna XSS se chor le lega.

4.8 30 Din Baad Expire
30 din baad refresh token expire → user ko dobara login karna padega.

Ye feature hai, bug nahi:

Agar refresh token kabhi expire na ho → chor ek baar chura le, hamesha access

30 din ka limit isliye hai

4.9 Sliding Expiration (Optional)
Jab bhi refresh token use ho, expiry aage badha do:

text
Din 1   → login → RT (expires Din 31)
Din 10  → refresh → naya RT (expires Din 40)
Din 20  → refresh → naya RT (expires Din 50)
Active user ko dobara login nahi karna padta. 30 din tak inactive rahe → expire.

5. familyId
5.1 Kya Hai
Ek login se banayi gayi saari refresh tokens ka group.

5.2 Kyun Zaroori
Normal rotation:

text
Login   → RT-1 diya (DB: RT-1)
Refresh → RT-1 delete, RT-2 diya (DB: RT-2)
Refresh → RT-2 delete, RT-3 diya (DB: RT-3)
Attack scenario:

Chor ne RT-1 chura liya. User ne refresh kiya → RT-2 mila. Ab chor RT-1 se try karta hai:

text
Chor → Refresh(RT-1) → DB mein nahi mila → 401 ✅
Lekin agar chor pehle chala le:

text
Chor → Refresh(RT-1) → RT-2 mila (chor ke paas ab RT-2)
User → Refresh(RT-1) → 401 (user confused, dobara login karega)
Chor ke paas RT-2 hai → 30 din tak ghusa rahega 😱
5.3 familyId Fix
Agar koi already-used token wapas aaye → matlab chori hui thi → poori family delete:

text
Login   → RT-1 (familyId=F1)
Refresh → RT-2 (familyId=F1)  ← same family
Refresh → RT-3 (familyId=F1)  ← same family

Agar RT-1 dobara aaya:
  → DB mein nahi mila
  → lekin F1 family ke tokens hain
  → Replay attack detect
  → F1 ke SAARE tokens delete (RT-2 bhi)
  → User + chor dono logout ✅
5.4 Code
ts
// Login pe — nayi family
familyId: crypto.randomUUID(),

// Refresh (rotate) pe — same family
familyId: row.familyId,
5.5 Chaabi Analogy
Ghar ki duplicate chaabiyan (A, B, C) — sab ek family F1 ki.

Rule: Agar koi purani chaabi use kare → poori family band.

Chor ke paas A aur B dono thi. A use ki → guard ne F1 ki saari chaabiyan band kar di → B bhi bekaar.

5.6 Simple Rakhna Ho To
familyId optional hai. Basic security ke liye zaroori nahi.

Agar advanced replay detection nahi chahiye:

familyId hata do schema se

Basic security intact rahegi (refresh token DB mein hai, revoke ho jata hai)

6. Logout & Expiry
6.1 Logout Pe Kya Hota
text
LOGOUT:
  Server: DB se refresh token DELETE
  Server: cookie clear (client se bhi gaya)

  Ab agar chor ke paas token ki copy hai:
  Chor: refresh endpoint pe bhejta hai
  Server: DB mein dhundha → NAHI MILA
  Server: 401 Unauthorized ✅
ts
export const logoutUser = async (rawRefresh: string) => {
  const tokenHash = hashToken(rawRefresh);
  await refreshTokenRepo.deleteByHash(tokenHash);
};
6.2 Access Token Logout Ke Baad Bhi Valid
Ye accepted trade-off hai:

text
10:00  → login, access token mila (expires 10:15)
10:05  → logout
10:10  → chor ke paas wahi access token
        → API call karega → signature valid → ghusa rahega
        → 10:15 tak (max 15 min)
Isliye access token ka lifetime chhota rakhte hain (5–15 min).

6.3 Summary Table
Cheez	Logout pe
Refresh token (Approach 2)	✅ Turant invalid (DB delete)
Refresh token (Approach 1)	❌ 30 din tak valid
Access token	❌ 15 min tak valid (dono approach)
Naya access token milega?	❌ Nahi (refresh token gaya)
Practically: Logout ke baad user ko dobara login karna padega.

6.4 Cleanup Cron (Optional)
30 din se purane expired tokens DB mein pade rehte hain. Ek cron:

ts
// Har raat ya har ghante
await refreshTokenRepo.deleteExpired();
// DELETE FROM refresh_tokens WHERE expires_at < NOW()
expiresAt pe index hai isliye fast chalega.

7. Drizzle Commands
7.1 Teen Commands
Command	Kaam	Kab
drizzle-kit generate	SQL migration file banata hai	Schema change ke baad
drizzle-kit migrate	SQL file DB pe apply + history	Production, team
drizzle-kit push	Seedha schema DB pe (no file)	Dev mein jaldi
drizzle-kit studio	GUI browser mein	Debugging
7.2 generate — SQL File
bash
pnpm db:generate
Kya karta hai:

schema.ts padhta hai

drizzle/0000_xxx.sql file banata hai

DB touch nahi karta

Output example:

text
drizzle/0000_clean_archangel.sql
Kab: Schema change karo, production ke liye migration banao.

7.3 migrate — SQL File Apply
bash
pnpm db:migrate
Kya karta hai:

drizzle/ folder ki .sql files dekhta hai

__drizzle_migrations table check — kaunsi apply ho chuki

Nayi migrations DB pe chalata hai

History entry banata hai

Kab: Production deployment.

Dhyaan: History maintain karta hai — same migration dobara nahi chalega.

7.4 push — Seedha Apply
bash
pnpm db:push
Kya karta hai:

schema.ts padhta hai

DB ka current state dekhta hai

Diff nikalke seedha apply

Koi file nahi, koi history nahi

Kab: Sirf dev mein.

Nuksan:

History nahi — production ke liye theek nahi

Team share nahi kar sakti

Kuch changes pe prompt — galti se data delete ho sakta

7.5 Recipe Book Analogy
Command	Analogy
generate	Recipe likhna — page add, banayi nahi
migrate	Recipe follow karke khana banana + tick
push	Bina recipe likhe khana banana
7.6 Workflows
Fast Dev:

bash
# schema.ts change karo
pnpm db:push
# kaam khatam
Production:

bash
# schema.ts change karo
pnpm db:generate       # SQL file
# file review, git commit
pnpm db:migrate        # DB pe apply
7.7 package.json Scripts
json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
7.8 drizzle.config.ts
ts
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
7.9 Rules
Kabhi push production pe mat chalao

migrate aur push mix mat karo — history ghalat

Production mein hamesha generate + migrate

8. Drizzle Schema
8.1 UUID Length — Always 36
ts
id: varchar('id', { length: 36 })
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID()),
crypto.randomUUID() 36 chars deta hai. length: 64 ka koi matlab nahi.

8.2 FK Length — Match Parent
ts
// auth.id → 36
// refreshTokens.userId → BHI 36
userId: varchar('user_id', { length: 36 })
  .notNull()
  .references(() => auth.id, { onDelete: 'cascade' }),
Mismatch = FK create nahi hoga.

8.3 Timestamps — Always mode: 'date'
ts
createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
Warna TypeScript string return karega, Date nahi. Comparison mein error aayega.

8.4 Booleans — Always .notNull()
ts
revoked: boolean('revoked').default(false).notNull(),
used: boolean('used').default(false).notNull(),
emailVerified: boolean('email_verified').default(false).notNull(),
Warna null ho sakta hai, if (x) pe confusion.

8.5 Indexes — Har FK + Lookup Column
ts
(t) => ({
  userIdx: index('user_idx').on(t.userId),
  tokenHashIdx: uniqueIndex('token_hash_idx').on(t.tokenHash),
  expiresIdx: index('expires_idx').on(t.expiresAt),
})
userId → user ke tokens query fast

tokenHash (unique) → lookup fast + duplicate prevent

expiresAt → cleanup cron fast

8.6 SHA-256 Hash Length = 64
ts
tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
SHA-256 hex = 64 chars. 255 zyada, 32 kam.

8.7 MySQL Mein defaultRandom() Nahi
Postgres only:

ts
uuid('id').primaryKey().defaultRandom()   // ❌ MySQL pe kaam nahi
MySQL mein:

ts
id: varchar('id', { length: 36 })
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID()),   // ✅
8.8 Drizzle Imports (MySQL)
ts
import {
  boolean,
  index,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
8.9 Postgres vs MySQL — Differences
Cheez	Postgres	MySQL
Table function	pgTable	mysqlTable
Import	drizzle-orm/pg-core	drizzle-orm/mysql-core
Connection	drizzle-orm/node-postgres + pg	drizzle-orm/mysql2 + mysql2
Dialect	'postgresql'	'mysql'
UUID type	uuid('id').defaultRandom()	varchar('id', { length: 36 }) + app mein randomUUID()
Insert return	.returning()	.$returningId()
8.10 DB Connection (MySQL)
ts
// src/db/index.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
});

export const db = drizzle(pool, { schema, mode: 'default' });
8.11 Password Special Characters in URL
URL mein encode karo:

Char	Encoded
@	%40
:	%3A
/	%2F
#	%23
Example: password my@pass#123 → my%40pass%23123

9. Layered Architecture
9.1 Layers
text
Request → Controller → Service → Repository → DB
Layer	Kaam	Kya Nahi
Controller	HTTP handle (req/res/cookie)	Business logic nahi
Service	Business logic (login, rotate, logout)	HTTP nahi
Repository	DB queries (Drizzle)	Logic nahi
Rule: Har layer sirf neeche wali ko call kare. Controller → Service → Repository. Ulti direction mein kabhi nahi.

9.2 Repository — Sirf DB
ts
// src/repositories/refreshToken.repository.ts
import { eq, lt } from 'drizzle-orm';
import { db } from '@/db';
import { refreshTokens } from '@/db/schema';

export const refreshTokenRepo = {
  create: (data: {
    tokenHash: string;
    userId: string;
    familyId: string;
    expiresAt: Date;
  }) => db.insert(refreshTokens).values(data),

  findByHash: (tokenHash: string) =>
    db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, tokenHash),
    }),

  deleteByHash: (tokenHash: string) =>
    db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash)),

  deleteById: (id: string) =>
    db.delete(refreshTokens).where(eq(refreshTokens.id, id)),

  deleteByFamily: (familyId: string) =>
    db.delete(refreshTokens).where(eq(refreshTokens.familyId, familyId)),

  deleteExpired: () =>
    db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date())),
};
Kya Nahi: if, throw, jwt.sign — kuch nahi. Sirf query.

9.3 Service — Business Logic
ts
// src/services/auth.service.ts
import crypto from 'crypto';
import { userRepo } from '@/repositories/user.repository';
import { refreshTokenRepo } from '@/repositories/refreshToken.repository';
import { generateAccessToken } from '@/utils/jwt.util';
import { generateRefreshToken, hashToken } from '@/utils/token.util';
import { hashPassword, verifyPassword } from '@/utils/password.util';
import { publishEvent } from '@/events/publisher';
import { AppError } from '@/errors/AppError';

const REFRESH_TTL_DAYS = 30;
const DAY_MS = 86400_000;

export const authService = {
  async signup(email: string, password: string) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new AppError('Email already used', 409);

    const passwordHash = await hashPassword(password);
    const user = await userRepo.create({ email, passwordHash, role: 'USER' });

    const accessToken = generateAccessToken({ sub: user.id, role: user.role });

    const rawRefresh = generateRefreshToken();
    await refreshTokenRepo.create({
      tokenHash: hashToken(rawRefresh),
      userId: user.id,
      familyId: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * DAY_MS),
    });

    await publishEvent('user.created', { userId: user.id, email: user.email });

    return { accessToken, refreshToken: rawRefresh, user };
  },

  async login(email: string, password: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new AppError('Invalid credentials', 401);

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new AppError('Invalid credentials', 401);

    const accessToken = generateAccessToken({ sub: user.id, role: user.role });

    const rawRefresh = generateRefreshToken();
    await refreshTokenRepo.create({
      tokenHash: hashToken(rawRefresh),
      userId: user.id,
      familyId: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * DAY_MS),
    });

    return { accessToken, refreshToken: rawRefresh, user };
  },

  async refresh(rawRefresh: string) {
    const tokenHash = hashToken(rawRefresh);
    const row = await refreshTokenRepo.findByHash(tokenHash);

    if (!row) throw new AppError('Invalid refresh token', 401);
    if (row.expiresAt < new Date()) {
      await refreshTokenRepo.deleteById(row.id);
      throw new AppError('Refresh token expired', 401);
    }

    // Rotation
    const newRaw = generateRefreshToken();
    await refreshTokenRepo.deleteById(row.id);
    await refreshTokenRepo.create({
      tokenHash: hashToken(newRaw),
      userId: row.userId,
      familyId: row.familyId,
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * DAY_MS),
    });

    const accessToken = generateAccessToken({ sub: row.userId });
    return { accessToken, refreshToken: newRaw };
  },

  async logout(rawRefresh: string) {
    await refreshTokenRepo.deleteByHash(hashToken(rawRefresh));
  },
};
Kya Nahi: req, res, res.cookie — kuch nahi. HTTP ka pata bhi nahi.

9.4 Controller — Sirf HTTP
ts
// src/controllers/auth.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } =
        await authService.login(email, password);

      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
      res.json({
        accessToken,
        user: { id: user.id, email: user.email, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const raw = req.cookies[REFRESH_COOKIE];
      if (!raw) return res.status(401).json({ error: 'No refresh token' });

      const { accessToken, refreshToken } = await authService.refresh(raw);

      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
      res.json({ accessToken });
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const raw = req.cookies[REFRESH_COOKIE];
      if (raw) await authService.logout(raw);

      res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
Kya Nahi: db., jwt.sign, hashToken — kuch nahi.

9.5 Routes
ts
// src/routes/auth.routes.ts
import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { requireAuth } from '@/middleware/auth.middleware';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
9.6 Folder Structure
text
src/
├── db/
│   ├── schema.ts
│   ├── index.ts
│   └── migrations/
├── repositories/
│   ├── user.repository.ts
│   ├── refreshToken.repository.ts
│   ├── passwordReset.repository.ts
│   └── emailVerification.repository.ts
├── services/
│   ├── auth.service.ts
│   ├── password.service.ts
│   └── verification.service.ts
├── controllers/
│   └── auth.controller.ts
├── events/
│   └── publisher.ts
├── routes/
│   └── auth.routes.ts
├── middleware/
│   └── auth.middleware.ts
├── utils/
│   ├── jwt.util.ts
│   ├── token.util.ts
│   └── password.util.ts
├── errors/
│   └── AppError.ts
├── types/
│   └── jwt.types.ts
└── lib/
    ├── db.ts (ya db/index.ts)
    └── rabbitmq.ts
9.7 Code Likhne ka Order
text
1. Types           (AccessTokenPayload, UserRole, AppError)
2. Utils           (jwt.util, token.util, password.util)
3. Repository      (DB queries)
4. Service         (business logic)
5. Controller      (HTTP)
6. Routes          (endpoints)
7. Middleware      (requireAuth)
Kyun: Neeche se upar — har layer ready milegi.

9.8 Kya Kahan — Cheat Sheet
Kaam	Kahan
db.select().from()	Repository
jwt.sign()	Service (ya util)
crypto.randomBytes()	Util (token.util)
hashToken()	Util
bcrypt.compare()	Util
Password check	Service
Rotation logic	Service
Replay detection	Service
res.cookie()	Controller
res.status(401)	Controller
req.cookies read	Controller
req.body read	Controller
Cookie options	Controller (ya constant)
Route define	Routes
Authorization header check	Middleware
9.9 Galat vs Sahi
❌ Galat — controller mein sab kuch:

ts
app.post('/login', async (req, res) => {
  const user = await db.select().from(users).where(...);
  // ... JWT sign, hash, DB insert, cookie set
  res.json({ token });
});
Problem: Test karna mushkil, reuse nahi, kaam mix.

✅ Sahi — teen layers:

ts
// Route
router.post('/login', authController.login);

// Controller: sirf HTTP
const { accessToken, refreshToken } = await authService.login(email, password);
res.cookie(...); res.json(...);

// Service: sirf logic
// Repository: sirf DB
10. RabbitMQ Events
10.1 Publisher
ts
// src/events/publisher.ts
import { channel } from '@/lib/rabbitmq';

const EXCHANGE = 'user.events';

export const publishEvent = async (routingKey: string, data: unknown) => {
  channel.publish(
    EXCHANGE,
    routingKey,                 // "user.created"
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );
};
10.2 Connection
ts
// src/lib/rabbitmq.ts
import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL!);
  channel = await conn.createChannel();
  await channel.assertExchange('user.events', 'topic', { durable: true });
};

export { channel };
10.3 Consumer (User Service)
ts
// user-service/src/events/consumer.ts
import { channel } from '@/lib/rabbitmq';
import { profileRepo } from '@/repositories/profile.repository';

export const startConsumers = async () => {
  const q = await channel.assertQueue('user-service.user-created', {
    durable: true,
  });

  await channel.bindQueue(q.queue, 'user.events', 'user.created');

  channel.consume(q.queue, async (msg) => {
    if (!msg) return;
    const { userId, email } = JSON.parse(msg.content.toString());

    await profileRepo.create({
      userId,
      email,
      name: null,
      avatar: null,
    });

    channel.ack(msg);
  });
};
10.4 Events List
text
user.created   → signup pe → User service profile banaye, Email service welcome mail bheje
user.deleted   → account delete → User service profile delete kare
user.updated   → email change → (agar koi sunne wala ho)
Rule: Sirf wahi event publish karo jiski dusri service ko zarurat ho.

10.5 Kyun Direct Call Nahi
Agar Auth service seedha User service ko call kare:

User service down → Auth service ka signup fail

Coupling badh jati hai

RabbitMQ ke saath:

Auth ne event daala, bhool gaya

User service jab up ho, utha legi

Loose coupling

11. Docker + Adminer + MySQL
11.1 Docker Compose
yaml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql-auth
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: nexusCoreV2_auth_db
      MYSQL_USER: nexusCoreV2_auth_user
      MYSQL_PASSWORD: your_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - mysql

volumes:
  mysql_data:
11.2 Adminer Login
text
System:    MySQL
Server:    mysql-auth          ← container_name
Username:  root                ← root se karo (DROP permissions)
Password:  rootpass
Database:  nexusCoreV2_auth_db
Server field: Adminer Docker ke andar hai → container name, localhost nahi.

11.3 Drizzle-kit Login (Alag)
.env mein:

env
DATABASE_URL=mysql://nexusCoreV2_auth_user:your_password@localhost:3306/nexusCoreV2_auth_db
Server field: Drizzle-kit tumhare laptop se chal raha hai → localhost.

11.4 Kahan Se Kya Likhna
Kahan se	Server field
Adminer (Docker) → MySQL (Docker)	mysql-auth (container name)
Drizzle-kit (laptop) → MySQL (Docker)	localhost
MySQL Workbench (laptop) → MySQL (Docker)	localhost
MySQL CLI (laptop) → MySQL (Docker)	localhost
Service (Docker) → MySQL (Docker, same compose)	mysql (service name)
Rule:

Docker ke andar se → service/container name

Docker ke bahar se (laptop) → localhost

11.5 Visual
text
┌─────────────────────────────────────────────┐
│  Tumhara Laptop                             │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐  │
│  │ drizzle-kit  │      │   Browser       │  │
│  │ (terminal)   │      │   (Adminer UI)  │  │
│  └──────┬───────┘      └────────┬────────┘  │
│         │                       │           │
│         │ localhost:3306        │ localhost:8080
│         │                       │           │
│  ┌──────▼───────────────────────▼───────┐   │
│  │  Docker                              │   │
│  │                                      │   │
│  │  ┌──────────┐    ┌──────────────┐    │   │
│  │  │  MySQL   │◄───│   Adminer    │    │   │
│  │  │  :3306   │    │   :8080      │    │   │
│  │  └──────────┘    └──────────────┘    │   │
│  │       ▲                              │   │
│  │       │ "mysql-auth" (internal)      │   │
│  └───────┼──────────────────────────────┘   │
└─────────────────────────────────────────────┘
11.6 Adminer Se Saari Tables Drop
SQL command tab mein:

sql
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS email_verifications;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS auth_users;
DROP TABLE IF EXISTS __drizzle_migrations;

SET FOREIGN_KEY_CHECKS = 1;
Phir terminal pe pnpm db:migrate.

Dhyaan: __drizzle_migrations bhi drop karna zaroori hai. Warna Drizzle ko lagega migration already apply ho chuki hai.

11.7 MySQL User Permissions Fix
Agar Access denied for user 'x'@'172.21.0.1' aaye:

bash
docker exec -it mysql-auth bash
mysql -u root -p
sql
DROP USER IF EXISTS 'nexusCoreV2_auth_user'@'172.21.0.1';

CREATE USER 'nexusCoreV2_auth_user'@'%'
  IDENTIFIED WITH mysql_native_password BY 'your_password';

GRANT ALL PRIVILEGES ON nexusCoreV2_auth_db.*
  TO 'nexusCoreV2_auth_user'@'%';

FLUSH PRIVILEGES;
11.8 .env Example
env
DATABASE_URL=mysql://nexusCoreV2_auth_user:your_password@localhost:3306/nexusCoreV2_auth_db
ACCESS_TOKEN_SECRET=some-long-random-string-min-32-chars
ACCESS_EXPIRE=15m
REFRESH_TTL_DAYS=30
RABBITMQ_URL=amqp://guest:guest@localhost:5672
NODE_ENV=development
11.9 Different .env Files
text
services/auth-service/
├── .env                  ← local dev (localhost)
├── .env.docker           ← docker (service name)
└── .env.example          ← template
Ya compose mein override karo:

yaml
auth-service:
  environment:
    DATABASE_URL: mysql://user:pass@mysql:3306/db
12. Complete Auth Schema
ts
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

// ─── Auth users ─────────────────────────────────────────
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
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => ({
    emailIdx: index('email_idx').on(t.email),
  })
);

// ─── Refresh tokens ─────────────────────────────────────
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
    familyIdx: index('family_idx').on(t.familyId),
    expiresIdx: index('expires_idx').on(t.expiresAt),
  })
);

// ─── Password resets ────────────────────────────────────
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
  })
);

// ─── Email verifications ────────────────────────────────
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
  })
);
13. Common Errors & Fixes
13.1 ERR_PACKAGE_PATH_NOT_EXPORTED ./_relations
Wajah: drizzle-kit aur drizzle-orm versions mismatch.

Fix: Compatible versions pin karo:

json
{
  "dependencies": { "drizzle-orm": "0.44.3" },
  "devDependencies": { "drizzle-kit": "0.31.4" }
}
Phir:

bash
pnpm install
pnpm dedupe drizzle-orm   # root se
13.2 Please install latest version of drizzle-orm
Wajah: pnpm monorepo mein hoisting issue.

Fix: Root mein .npmrc:

ini
public-hoist-pattern[]=*drizzle*
Phir pnpm install.

.npmrc kya hai: Config file jo npm/pnpm ko batati hai ke dependencies kaise install karni hain. public-hoist-pattern likh ke batate ho ke kaunse package root node_modules mein bhi rakhe jayein — taaki doosre packages unhe dhundh sakein.

13.3 Table 'auth_users' already exists
Wajah: Tables manually ya push se bane, lekin __drizzle_migrations mein entry nahi.

Fix (dev): Sab tables drop + __drizzle_migrations bhi (Adminer se):

sql
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS email_verifications;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS auth_users;
DROP TABLE IF EXISTS __drizzle_migrations;
SET FOREIGN_KEY_CHECKS = 1;
Phir pnpm db:migrate.

Ya: pnpm db:push (existing tables handle karta hai).

13.4 Access denied for user 'x'@'172.21.0.1'
Wajah: Docker container se MySQL, permission nahi.

Fix: Section 11.7 dekho.

13.5 Type 'string' is not assignable to type 'UserRole'
Wajah: Drizzle default string return karta hai.

Fix: Schema mein type narrow karo:

ts
role: varchar('role', { length: 20 })
  .$type<UserRole>()
  .notNull()
  .default('USER'),
13.6 An expression of type 'void' cannot be tested for truthiness
Wajah: Repository mein return bhool gaye.

Fix: Arrow implicit return:

ts
// ❌
findByEmail: (email: string) => {
  db.query.users.findFirst({ where: eq(users.email, email) });
}

// ✅
findByEmail: (email: string) =>
  db.query.users.findFirst({ where: eq(users.email, email) }),
13.7 defaultRandom does not exist
Wajah: MySQL ya Gel use kar rahe ho, Postgres nahi.

Fix: pgTable ki jagah mysqlTable, aur $defaultFn use karo.

13.8 Object literal may only specify known properties, and 'id' does not exist
Wajah: Galat dialect ke types import kar rahe ho (MySQL vs Postgres vs Gel).

Fix: Check karo:

mysqlTable import drizzle-orm/mysql-core se

Connection drizzle-orm/mysql2 se

drizzle.config.ts mein dialect: 'mysql'

13.9 Multiple Node Modules (pnpm monorepo)
bash
# Root se
cd /path/to/monorepo
pnpm dedupe drizzle-orm
Ya pnpm.overrides:

json
{
  "pnpm": {
    "overrides": {
      "drizzle-orm": "0.44.3",
      "drizzle-kit": "0.31.4"
    }
  }
}
13.10 Clean Reinstall (Nuclear Option)
bash
# Root se
find . -name "node_modules" -type d -prune -exec rm -rf {} +
pnpm store prune
pnpm install
14. Code Writing Order
14.1 Order
text
1. Types              → AccessTokenPayload, UserRole, AppError
2. Utils              → jwt.util, token.util, password.util
3. DB Connection      → db/index.ts
4. Repository         → userRepo, refreshTokenRepo, etc.
5. Service            → authService
6. Events             → publisher (RabbitMQ)
7. Controller         → authController
8. Routes             → /signup, /login, /refresh, /logout
9. Middleware         → requireAuth
14.2 Milestone Order
Milestone 1 (Basic Auth):

Types, Utils, DB connection, Repositories

Auth service (signup, login, refresh, logout)

Controller, Routes, Middleware

Milestone 2 (Email + Password Reset):

Password reset service + repo

Email verification service + repo

Email util (nodemailer)

Events publisher

Milestone 3 (RabbitMQ + Microservices):

RabbitMQ connection

Publisher

User service consumer (separate service)

Milestone 4 (Advanced):

OAuth (Google, GitHub)

2FA

Rate limiting

Device tracking

14.3 AppError Class
ts
// src/errors/AppError.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
14.4 Password Utils
ts
// src/utils/password.util.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
15. Quick Cheat Sheet
15.1 Commands
bash
pnpm db:generate      # SQL file banao
pnpm db:migrate       # DB pe apply (history ke saath)
pnpm db:push          # Seedha apply (dev only)
pnpm db:studio        # GUI
15.2 Schema Rules
UUID length = 36 hamesha

FK length = parent length

SHA-256 hash length = 64

Timestamps pe { mode: 'date' }

Booleans pe .notNull()

Har FK + lookup column pe index

15.3 Tokens
Access: JWT, 15 min, stateless

Refresh: Opaque random, 30 din, DB mein hash

Rotation: Har refresh pe naya token, same familyId

Logout: DB se delete + cookie clear

Cookie: httpOnly + secure + sameSite=strict + path=/auth

15.4 Docker
Adminer (Docker se) → container name (mysql-auth)

Drizzle-kit (laptop se) → localhost

Service (Docker se) → service name (mysql)

15.5 Layers
Controller = HTTP (req/res/cookie)

Service = business logic

Repository = DB queries

15.6 Token Verify Rules
Request	Kya verify
API call (/posts)	Sirf access token
Refresh (/auth/refresh)	Sirf refresh token
Dono kabhi ek saath	❌ Nahi
15.7 Migration Rules
Dev mein push use karo

Production mein generate + migrate

migrate aur push mix mat karo

__drizzle_migrations manually mat touch karo

15.8 Analogy Reference
Concept	Analogy
Access token	15-min parking ticket
Refresh token	Monthly parking pass
familyId	Ghar ki duplicate chaabiyan
issuer	Chitthi ka From
audience	Chitthi ka To
generate	Recipe likhna
migrate	Recipe follow + tick
push	Bina recipe khana banana
16. Do's and Don'ts
16.1 Do's
Dev mein push use karo

Production mein generate + migrate

Refresh token hash karke DB mein store karo

Access token httpOnly cookie ya memory mein rakho

Har FK pe index lagao

Migration files git mein commit karo

expiresAt pe index lagao (cleanup ke liye)

familyId use karo replay detection ke liye

issuer + audience JWT mein daalo

Cookie pe path: '/auth' set karo (leak window kam)

Sliding expiration consider karo (active users ke liye)

16.2 Don'ts
Production pe push mat chalao

migrate aur push mix mat karo

Refresh token ko JWT mat banao

Refresh token plain DB mein mat rakho

Refresh token localStorage mein mat rakho (XSS)

Refresh token JSON response mein mat bhejo (sirf cookie mein)

auth.id ko 64 length mat do (UUID 36 hota hai)

__drizzle_migrations manually mat touch karo

Access token 24 ghante ka mat banao

Service mein req/res mat use karo

Controller mein db. mat use karo

Repository mein business logic mat likho

16.3 Security Checklist
□ Refresh token hashed in DB
□ Access token short-lived (15 min)
□ Cookies httpOnly + secure + sameSite
□ Password bcrypt (12 rounds+)
□ JWT secret 32+ chars random
□ issuer + audience checked
□ familyId for replay detection
□ Rate limiting on login/refresh
□ HTTPS in production
□ CORS properly configured
Appendix A: Full Signup/Login/Refresh Flow
A.1 Signup
text
1. POST /auth/signup { email, password }
2. Controller → Service.signup()
3. Service:
   - check existing user
   - hash password
   - create user in DB
   - generate access token (JWT)
   - generate refresh token (random)
   - hash refresh token → store in DB with familyId
   - publish "user.created" event to RabbitMQ
4. Controller:
   - set refresh token cookie
   - return access token in JSON
5. User Service (parallel):
   - consume "user.created"
   - create profile row
6. Email Service (parallel):
   - consume "user.created"
   - send welcome email
A.2 Login
text
1. POST /auth/login { email, password }
2. Controller → Service.login()
3. Service:
   - find user by email
   - verify password
   - generate access token
   - generate refresh token + hash + store
   - new familyId
4. Controller:
   - set refresh cookie
   - return access token
A.3 API Call
text
1. GET /posts
   Authorization: Bearer <accessToken>
2. Middleware:
   - extract token
   - verify signature (no DB)
   - attach payload to req.user
3. Route handler:
   - use req.user
A.4 Refresh (Access Token Expired)
text
1. POST /auth/refresh
   Cookie: refresh_token=<raw>
2. Controller → Service.refresh()
3. Service:
   - hash incoming raw
   - find in DB
   - check expiry
   - check revoked
   - delete old row (rotation)
   - create new row with SAME familyId
   - generate new access token
4. Controller:
   - set new refresh cookie
   - return new access token
A.5 Logout
text
1. POST /auth/logout
   Cookie: refresh_token=<raw>
2. Controller → Service.logout()
3. Service:
   - hash incoming raw
   - delete from DB
4. Controller:
   - clear cookie
   - return 204
5. Chor ke paas token ho bhi to DB mein nahi → 401
A.6 Cron Cleanup (Optional)
text
Every hour:
  DELETE FROM refresh_tokens
  WHERE expires_at < NOW()

(or)
  DELETE FROM refresh_tokens
  WHERE revoked = true AND created_at < NOW() - INTERVAL 7 DAY
Appendix B: Environment Setup
B.1 Required Packages
bash
# Production
pnpm add drizzle-orm mysql2 jsonwebtoken bcrypt amqplib cookie-parser

# Dev
pnpm add -D drizzle-kit @types/jsonwebtoken @types/bcrypt @types/cookie-parser @types/amqplib typescript tsx
B.2 tsconfig.json (Key Settings)
json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
B.3 Root .npmrc (Monorepo)
ini
public-hoist-pattern[]=*drizzle*
public-hoist-pattern[]=*prisma*
auto-install-peers=true
strict-peer-dependencies=false
B.4 Recommended Versions
json
{
  "dependencies": {
    "drizzle-orm": "0.44.3",
    "mysql2": "^3.11.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "amqplib": "^0.10.4",
    "cookie-parser": "^1.4.6"
  },
  "devDependencies": {
    "drizzle-kit": "0.31.4",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.7",
    "@types/amqplib": "^0.10.5"
  }
}
End of notes. Last updated: 2026-09-13
```
