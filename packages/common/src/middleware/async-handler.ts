/* eslint-disable no-unused-vars */

import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ParsedQs } from 'qs';

/**
 * Type definition for an asynchronous Express route handler.
 */
export type AsyncHandler<
  Params = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
> = (
  req: Request<Params, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Normalizes any caught value into a standard native Error instance.
 */
const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

/**
 * Wraps asynchronous route handlers to catch uncaught promise rejections
 * and automatically forward them to Express's global error middleware.
 */
export const asyncHandler = <
  Params = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  fn: AsyncHandler<Params, ResBody, ReqBody, ReqQuery>,
): RequestHandler<Params, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next): void => {
    Promise.resolve(fn(req as Request<Params, ResBody, ReqBody, ReqQuery>, res, next)).catch(
      (err: unknown) => {
        next(toError(err));
      },
    );
  };
};
