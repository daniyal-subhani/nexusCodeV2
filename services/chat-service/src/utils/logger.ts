import { createLogger } from '@nexus/common';
import type { Logger } from 'pino';

export const logger: Logger = createLogger({
  serviceName: 'gateway-service',
  level: process.env.LEVEL,
});
