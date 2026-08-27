import { createEnv } from '@t3-oss/env-core/dist';
import { z } from 'zod';

export const baseEnvSchema = {
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
};

export const createServiceEnv = <T extends Record<string, z.ZodTypeAny>>(
  extraServerSchemas?: T,
  customRuntimeEnv?: Record<string, string | undefined>,
) => {
  return createEnv({
    server: {
      ...baseEnvSchema,
      ...extraServerSchemas,
    },
    runtimeEnv: customRuntimeEnv ?? process.env,
    emptyStringAsUndefined: true,
  });
};

export const commonEnv = createServiceEnv();
