import path from 'path';
import fs from 'fs';
import { Job } from 'bullmq';
import { StorageAdapter } from '../../common/adapters/storage.adapter';
import { FfmpegProcessor } from './processor/ffmpeg.processor';
import logger from '../../common/utils/logger';

export const processVideoJob = async (job: Job) => {
    const { fileKey, processingOptions } = job.data;
    const jobId = job.id;

    logger.info(`[Job ${jobId}] Starting Pipeline...`);
    const tempDir = path.resolve('temp');
    const inputPath = path.join(tempDir, 'uploads', `${jobId}_in`);
    const outputPath = path.join(tempDir, 'processed', `${jobId}_out.mp4`);
    const outputKey = `processed/${jobId}.mp4`;

    try {
        await job.updateProgress(10);
        logger.info(`[Job ${jobId}] Downloading from S3...`);
        await StorageAdapter.download(fileKey, inputPath);

        await job.updateProgress(30);
        logger.info(`[Job ${jobId}] Transcoding...`);
        await FfmpegProcessor.processFile(inputPath, outputPath, processingOptions || {});

        await job.updateProgress(80);
        logger.info(`[Job ${jobId}] Uploading Result...`);
        await StorageAdapter.upload(outputPath, outputKey);

        await job.updateProgress(100);
        return {
            status: 'completed',
            originalKey: fileKey,
            resultKey: outputKey,
            downloadUrl: await StorageAdapter.getPresignedUrl(outputKey, 'video/mp4') // Optional: Generate download link
        };

    } catch (error) {
        logger.error(`[Job ${jobId}] Pipeline Failed:`, error);
        throw error;
    } finally {
        [inputPath, outputPath].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
                logger.info(`[Job ${jobId}] Deleted temp file: ${file}`);
            }
        });
    }
};