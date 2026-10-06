import { createServiceEnv, z } from '@nexus/common';
import dotenv from "dotenv";

dotenv.config()
export const env = createServiceEnv({
  NODE_ENV: z.enum(['development', 'production', 'test']).default("development"),
  PORT: z.coerce.number().positive().default(4000),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32),
  AUTH_SERVICE_URL: z.url().default('http://localhost:4001'),
  USER_SERVICE_URL: z.url().default('http://localhost:4002'),
  CHAT_SERVICE_URL: z.url().default('http://localhost:4003'),
  REDIS_URL: z.url().default('redis://localhost:6379')
});
