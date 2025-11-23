import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisConnection } from '../config/redis.config';
import { Request, Response, NextFunction } from 'express';
import { LIMITS } from "../config/limit";

const ratelimiter = new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'upload_limit',
    points: LIMITS.MAX_UPLOADS_PER_HOURS,
    duration: 60 * 60,
});

export const uploadratelimiter = (req: Request, res: Response, next: NextFunction) => {
    const key = (req.user as any)?.id || req.ip;
    ratelimiter.consume(key)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).json({
                error: "Too many upload requests. Please wait an hour."
            });
        });
}