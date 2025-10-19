import { VideoFormat, VideoInfoResponse } from '../types/types';
import { spawn } from 'child_process';
import { Response } from 'express';
import https from 'https';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import logger from '../utils/logger';
import { error } from 'winston';

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

export const streamFullVideo = (url: string, formatId: string, res: Response): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const args = [
                '-f', formatId,
                url,
                '-o', '-'
            ];
            const ytdlp = spawn('yt-dlp', args);

            ytdlp.stdout.pipe(res);

            ytdlp.stderr.on('data', (data) => {
                logger.warn(`yt-dlp stderr (stream): ${data.toString()}`);
            });

            ytdlp.on('error', (error) => {
                logger.error('Failed to start yt-dlp process for streaming', { error: error.message, stack: error.stack });
                reject(error);
            });

            ytdlp.on('close', (code) => {
                if (code !== 0) {
                    logger.error(`yt-dlp process exited with code ${code} (stream)`);
                }
                resolve();
            });

            res.on('close', () => {
                logger.info('Client Closed Connection Too Early (stream), killing yt-dlp.');
                ytdlp.kill();
                resolve();
            });

        } catch (error: any) {
            logger.error('An Error Occured While spawning yt-dlp for streaming', { error: error.message, stack: error.stack });
            reject(error);
        }
    });
};

export const processandtrimvideo = async (options: {
    url: string,
    formatId: string,
    startTime: string,
    endTime: string
}): Promise<string> => {
    const uniqueSuffix = crypto.randomUUID();
    const inputPath = path.join(os.tmpdir(), `vortex-input-${uniqueSuffix}.mp4`);
    const outputPath = path.join(os.tmpdir(), `vortex-output-${uniqueSuffix}.mp4`);

    logger.info(`Generated temp paths. Input: ${inputPath}, Output: ${outputPath}`);
    try {
        logger.info('Downloading full video to server using yt-dlp...');
        const ytdlpArgs = [
            '-f', options.formatId,
            options.url,
            '-o', inputPath
        ];
        await runSpawnCommand('yt-dlp', ytdlpArgs);
        logger.info('Download complete.');
        logger.info('Starting ffmpeg trim process...');
        const ffmpegArgs = [
            '-i', inputPath,
            '-ss', options.startTime,
            '-to', options.endTime,
            '-c', 'copy',
            outputPath
        ];
        await runSpawnCommand('ffmpeg', ffmpegArgs);
        logger.info('FFmpeg trim process completed.');
        return outputPath;

    } catch (error) {
        logger.error('Failed during trim process:', error);
        throw error;
    }
    finally {
        fs.unlink(inputPath, (err: any) => {
            if (err) {
                logger.error(`Error deleting temp INPUT file ${inputPath}:`, { error: err.message, stack: err.stack });
            } else {
                logger.info(`Successfully cleaned up temp INPUT file: ${inputPath}`);
            }
        });
    }
};