// import { redis } from '../lib/redis';
// import type { Request, Response, Next } from 'express';

// export function rateLimit(bucket: string, limit: number, windowSec: number) {
//   return async (req: Request, res: Response, next: Next) => {
//     const key = `rate-limit:${bucket}:${req.user?.id ?? req.ip}`;
//     const count = await redis.incr(key);
//     if (count === 1) await redis.expire(key, windowSec);
//     if (count > limit) {
//       return res.setHeader('Retry-After', windowSec).status(429).json({
//         error: 'rate_limited',
//       });
//     }
//     next();
//   };
// }
