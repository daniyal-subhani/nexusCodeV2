import pino from 'pino';

import type { Logger, LoggerOptions } from 'pino';

export interface LoggerConfig {
  serviceName: string;
  level?: string;
}

export const createLogger = (config: LoggerConfig): Logger => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const options: LoggerOptions = {
    name: config.serviceName,
    level: config.level || process.env.LOG_LEVEL || 'info',
    base: {
      service: config.serviceName,
      env: process.env.NODE_ENV || 'development',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };
  if (isDevelopment) {
    options.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid, hostname',
        singleLine: false,
      },
    };
  }
  return pino(options);
};
