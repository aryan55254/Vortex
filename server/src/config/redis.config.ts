import Redis from "ioredis"
import { env } from "./env"
import logger from "../utils/logger";

const redis_port = env.REDIS_PORT;
const redis_host = env.REDIS_HOST;

export const redisConnection = new Redis(
    {
        port: redis_port,
        host: redis_host,
        password: "mish::3791",
        maxRetriesPerRequest: null,
    }
);
redisConnection.on('connect', () => {
    logger.info(`Connected to Redis at ${redis_host}:${redis_port}`);
});

redisConnection.on('error', (err) => {
    logger.error('Failed to connect to Redis:', err);
});