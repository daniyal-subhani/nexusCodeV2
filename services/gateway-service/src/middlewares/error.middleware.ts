import { gatewayLogger } from '@/observability/logger';
import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
 gatewayLogger.error({
  err: error,
  requestId: req.requestId,
  method: req.method,
  path: req.originalUrl
 }, "Unhandled application error");
 if(res.headersSent) {
  return
 }
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    },
  });
};
