import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.config";

const connection = redisConnection;

export const trimjobs = new Queue('trim-jobs-queue', { connection });
