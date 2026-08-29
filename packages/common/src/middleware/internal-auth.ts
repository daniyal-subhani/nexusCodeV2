import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../errors/http-error';

export interface InternalAuthOptions {
  headerName?: string;
  exemptPaths?: string[];
}

const DEFAULT_HEADER_NAME = 'x-internal-token';

/**
 * Ensures microservice endpoints can only be called by authorized internal services (e.g. Gateway).
 */
export const createInternalAuthMiddleware = (
  expectedToken: string,
  options: InternalAuthOptions = {},
): RequestHandler => {
  const headerName = options.headerName?.toLowerCase() ?? DEFAULT_HEADER_NAME;
  const exemptPaths = new Set(options.exemptPaths ?? []);

  return (req, _res, next) => {
    if (exemptPaths.has(req.path)) {
      next();
      return;
    }

    const provided = req.headers[headerName];
    const token = Array.isArray(provided) ? provided[0] : provided;

    if (typeof token !== 'string' || token !== expectedToken) {
      next(new UnauthorizedError('Invalid or missing internal service token'));
      return;
    }

    next();
  };
};
