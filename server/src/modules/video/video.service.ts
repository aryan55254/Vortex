import { VideoFormat, VideoInfoResponse } from '../../common/types/types';
import { spawn } from 'child_process';
import { Response } from 'express';
import https from 'https';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import logger from '../utils/logger';

const runSpawnCommand = (command: string, args: any[]): Promise<string> => {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args);

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        child.on('close', (code) => {
            if (code !== 0 && !stdout) {
                const error = new Error(stderr);
                reject(error);
            } else {
                resolve(stdout);
            }
        });
        child.on('error', (err) => {
            reject(err);
        });
    });
};


export const getVideoInfo = async (url: string): Promise<VideoInfoResponse> => {
    try {
        const stdout = await runSpawnCommand('yt-dlp', ['--dump-json', url]);
        const rawData: any = JSON.parse(stdout);
        const cleanFormats: VideoFormat[] = rawData.formats
            .filter((f: any) =>
                f.vcodec !== 'none' &&
                f.acodec !== 'none' &&
                f.ext === 'mp4'
            )
            .map((f: any) => ({
                formatId: f.format_id,
                resolution: f.resolution || `${f.width}x${f.height}`,
                ext: f.ext,
            }));
        const metadata: VideoInfoResponse = {
            title: rawData.title,
            thumbnail: rawData.thumbnail,
            duration: rawData.duration,
            formats: cleanFormats,
        };

        return metadata;
    }
    catch (err: any) {
        logger.error('An Error Occured While getting video info', { error: err.message, stack: err.stack });
        throw new Error(`Failed to fetch metadata. The URL might be invalid or unsupported.`);
    }

};

export const trimSmartly = async (options: {
    url: string,
    formatId: string,
    startTime: string,
    endTime: string
}): Promise<string> => {

    const uniqueSuffix = crypto.randomUUID();
    const outputPath = path.join(os.tmpdir(), `vortex-output-${uniqueSuffix}.mp4`);
    logger.info(`Generated temp path. Output: ${outputPath}`);
    try {
        logger.info('Starting yt-dlp smart trim process...');
        const ytdlpArgs = [
            '-f', options.formatId,
            '--download-sections', `*${options.startTime}-${options.endTime}`,
            '-o', outputPath,
            options.url
        ];
        await runSpawnCommand('yt-dlp', ytdlpArgs);

        logger.info(`Trimmed download complete. File at: ${outputPath}`);
        return outputPath;

    } catch (error) {
        logger.error('Failed during trim process:', error);
        try {
            if (fs.existsSync(outputPath)) {
                await fs.promises.unlink(outputPath);
                logger.info(`Cleaned up failed file: ${outputPath}`);
            }
        } catch (cleanupError) {
            logger.warn(`Failed to cleanup temp file ${outputPath}:`, cleanupError);
        }
        throw error;
    }
}
export const processTrimJob = async (options: {
    url: string,
    formatId: string,
    startTime: any,
    endTime: any,
}): Promise<string> => {

    logger.info('--- New Trim Job Received ---');
    try {
        logger.info('Attempting Trim...');
        const outputPath = await trimSmartly(options);
        logger.info('Smart Trim Succeeded.');
        return outputPath;

    } catch (smartTrimError) {
        logger.error("Trim Failed");
        throw smartTrimError;
    }
}