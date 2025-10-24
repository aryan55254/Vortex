import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.config";

const connection = redisConnection;

export const high_priority_jobs = new Queue('high-priority-queue', { connection });
export const low_priority_jobs = new Queue('low-priority-queue', { connection });