import express, { Application } from 'express';
import { router } from './routes/index';
import { errorMiddleware } from './middlewares/error.middleware';
import { requestIdMiddleware } from './middlewares/request-id.middleware';
import { requestLoggerMiddleware } from './middlewares/request-logger.middleware';
import helmet from 'helmet';
import { rateLimitMiddleware } from './middlewares/rate-limit.middleware';
import { corsMiddleware } from './middlewares/cors.middleware';
import { healthRouter } from './routes/health.routes';

const app: Application = express();

// 1. Security
app.use(helmet());
// 2. CORS
app.use(corsMiddleware);
// 3. Request ID
app.use(requestIdMiddleware);
// 4. Request logging
app.use(requestLoggerMiddleware);
// 5. Global rate limit
app.use(rateLimitMiddleware);
// 6. Request parsing
app.use(express.json({ limit: '1mb' }));
// 7. Health
app.use('/api/health', healthRouter);
// 8. API routes
app.use('/api', router);

// 9. 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Route not found',
    },
  });
});
// 10. Error handler - MUST BE LAST
app.use(errorMiddleware);

export default app;
