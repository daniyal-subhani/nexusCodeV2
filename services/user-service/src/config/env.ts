import { createServiceEnv, z } from '@nexus/common';

export const env = createServiceEnv({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(5001),
  JWT_SECRET: z.string().min(32),
});
