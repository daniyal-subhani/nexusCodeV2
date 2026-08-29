import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const createServiceEnv = <T extends Record<string, z.ZodTypeAny>>(
  serverSchema: T,
  customRuntimeEnv?: Record<string, string | undefined>,
) => {
  return createEnv({
    server: serverSchema,
    runtimeEnv: customRuntimeEnv ?? process.env,
    emptyStringAsUndefined: true,
  });
};
