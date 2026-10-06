import { redis } from "@/config/redis";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

export const rateLimitMiddleware = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store: new RedisStore({
         sendCommand: (...args: string[]) => redis.sendCommand(args)
    }),
    message: {
        success: false,
        error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later."
        }
    }
});

export const authRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    store: new RedisStore({
        sendCommand: (...args: string[]) => redis.sendCommand(args)
    }),
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later."
    }
})