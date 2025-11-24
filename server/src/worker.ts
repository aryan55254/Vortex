import { Worker, Job } from 'bullmq';
import { env } from './common/config/env';
import { VIDEO_QUEUE_NAME } from './modules/video/video.queue';
import { processVideoJob } from './modules/video/video.service';
import logger from './common/utils/logger';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

cron.schedule('*/30 * * * *', () => {
    logger.info('Reaper: Scanning for stale files...');
    const dirs = ['temp/uploads', 'temp/processed'];

    dirs.forEach(dir => {
        const fullPath = path.resolve(dir);
        if (!fs.existsSync(fullPath)) return;

        fs.readdir(fullPath, (err, files) => {
            if (err) return;
            files.forEach(file => {
                const filePath = path.join(fullPath, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) return;
                    const age = Date.now() - stats.mtimeMs;
                    if (age > 60 * 60 * 1000) {
                        fs.unlink(filePath, () => logger.warn(`Reaper deleted: ${file}`));
                    }
                });
            });
        });
    });
});


logger.info(`Worker Listening on Queue: ${VIDEO_QUEUE_NAME}`);

const worker = new Worker(VIDEO_QUEUE_NAME, async (job: Job) => {
    return await processVideoJob(job);
}, {
    connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined
    },
    concurrency: 1,
    lockDuration: 60000 * 5
});

worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed: ${err.message}`);
});

const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, closing worker...`);
    await worker.close();
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));