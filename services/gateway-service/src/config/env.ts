import { createServiceEnv, z } from '@nexus/common';

export const env = createServiceEnv({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(4070),
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32),
});
