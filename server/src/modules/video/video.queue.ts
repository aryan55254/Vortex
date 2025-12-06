import { Queue } from "bullmq";
import { env } from "../../common/config/env";

export const VIDEO_QUEUE_NAME = 'video-processing-queue';

export const videoQueue = new Queue(VIDEO_QUEUE_NAME, {
    connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined
    },
    defaultJobOptions: {
        attempts: 1,
        backoff: {
            type: 'fixed',
            delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: 100
    }

});