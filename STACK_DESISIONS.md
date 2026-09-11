# NexusCore — Microservices Stack Decisions

> Complete technology choices, database recommendations, and production-grade tooling for each microservice.

---

## 🎯 Services Overview

| Service          | Purpose                              | Database             | Queue    | Cache |
| ---------------- | ------------------------------------ | -------------------- | -------- | ----- |
| **Gateway**      | API entry point, routing, auth check | None (stateless)     | —        | Redis |
| **Auth**         | Identity, JWT, sessions, OAuth       | MySQL (Drizzle)      | RabbitMQ | Redis |
| **User**         | Profiles, preferences, search        | PostgreSQL (Prisma)  | RabbitMQ | Redis |
| **Chat**         | Messages, rooms, real-time           | MongoDB (Mongoose)   | RabbitMQ | Redis |
| **Notification** | Email, push, in-app                  | PostgreSQL (Drizzle) | RabbitMQ | Redis |

---

## 1️⃣ GATEWAY SERVICE

### Purpose

- Single entry point for all client requests
- JWT verification (access token)
- Rate limiting per user/IP
- Request routing to internal services
- CORS handling
- Request ID generation (tracing)
- Logging

### Stack

- **Framework:** Fastify (fastest) or Express
- **Language:** TypeScript
- **Database:** ❌ None (stateless)
- **Cache:** Redis (rate limit counters, JWT blacklist)
- **Reverse Proxy:** Nginx (before gateway, TLS termination)

### Why

Gateway should be **stateless** — no DB calls. Only Redis for short-lived data.

---

## 2️⃣ AUTH SERVICE

### Purpose

- Signup, login, logout
- JWT issue + refresh
- Password reset
- Email verification
- OAuth (Google, GitHub)
- Session management
- Token revocation

### Stack

- **Framework:** Express / Fastify
- **Database:** **MySQL** (Drizzle ORM)
- **Cache:** Redis (sessions, rate limit)
- **Queue:** RabbitMQ (emit user events)
- **Hashing:** bcrypt (12 rounds) or argon2
- **JWT:** `jose` (modern) or `jsonwebtoken`

### Why MySQL

- Relational data: users, sessions, refresh tokens
- Strong consistency required for auth
- Drizzle = TypeScript-first, type-safe

### Schema Highlights

```sql
users (id, email, password_hash, role, email_verified, created_at)
sessions (id, user_id, refresh_token_hash, user_agent, ip, revoked_at, expires_at)
oauth_accounts (id, user_id, provider, provider_user_id)
password_resets (id, user_id, token_hash, expires_at, used)
email_verifications (id, user_id, token_hash, expires_at, used)
```
