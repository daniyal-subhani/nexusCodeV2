import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type z, type ZodType } from 'zod';
import { ValidationError } from '../errors/http-error';
import type { ParsedQs } from 'qs';

// A flexible type mirroring the layout of the express Request
export interface RequestValidationSchemas<
  B extends ZodType = ZodType,
  P extends ZodType = ZodType,
  Q extends ZodType = ZodType,
> {
  body?: B;
  params?: P;
  query?: Q;
}

const formatZodIssues = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

/**
 * Express middleware to validate request body, params, and query against Zod schemas.
 * Automatically infers and passes TypeScript typings to subsequent route handlers.
 */
export const validateRequest = <
  B extends ZodType = ZodType,
  P extends ZodType = ZodType,
  Q extends ZodType = ZodType,
>(
  schemas: RequestValidationSchemas<B, P, Q>,
): RequestHandler<
  z.infer<P> extends Record<string, string> ? z.infer<P> : Record<string, string>, // Intersect with Express Params type
  unknown,
  z.infer<B>,
  z.infer<Q> extends ParsedQs ? z.infer<Q> : ParsedQs // Intersect with Express Query type
> => {
  const handler: RequestHandler = (
    req: Request<any, any, any>,
    _res: Response,
    next: NextFunction,
  ): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request['params'];
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request['query'];
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ValidationError('Validation Error', {
            issues: formatZodIssues(error),
          }),
        );
        return;
      }

      next(error);
    }
  };
  return handler as unknown as RequestHandler<
    z.infer<P> extends Record<string, string> ? z.infer<P> : Record<string, string>,
    unknown,
    z.infer<B>,
    z.infer<Q> extends ParsedQs ? z.infer<Q> : ParsedQs
  >;
};
