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

const downloadFile = (url: string, dest: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(dest);

        const request = https.get(url, (response) => {
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        });

        request.on('error', (err) => {
            logger.error('An Error Occured While Downloading File', { error: err.message, stack: err.stack });
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

async function getDirectUrl(url: string, formatId: string): Promise<string> {
    try {
        const args = ['-f', formatId, '-g', url];
        const stdout = await runSpawnCommand('yt-dlp', args);
        const directUrl = stdout.trim();

        if (!directUrl) {
            throw new Error('yt-dlp did not return a URL for the given format.');
        }

        return directUrl;

    } catch (err: any) {
        logger.error('An Error Occured While getting url', { error: err.message, stack: err.stack });
        throw new Error('Could not get a downloadable link for the requested format.');
    }
}

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
    return new Promise(async (resolve, reject) => {
        try {
            const directVideoUrl = await getDirectUrl(url, formatId);
            const request = https.get(directVideoUrl, (downloadstream) => {
                downloadstream.on('error', (error) => {
                    logger.error('An Error Occured While dowloading stream', { error: error.message, stack: error.stack });
                    reject(error);
                });

                downloadstream.pipe(res);

                res.on('finish', () => {
                    resolve();
                });
                res.on('close', () => {
                    logger.info('Client Closed Connection Too Early');
                    downloadstream.destroy();
                    resolve();
                });
            });
            request.on('error', (error) => {
                logger.error('An Error Occured While making initial get request', { error: error.message, stack: error.stack });
                reject(error);
            });

        }
        catch (error: any) {
            logger.error('An Error Occured While streaming full video', { error: error.message, stack: error.stack });
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
        logger.info('Getting direct video URL...');
        const directUrl = await getDirectUrl(options.url, options.formatId);
        logger.info('Downloading full video to server...');
        await downloadFile(directUrl, inputPath);
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
    }
    finally {
        fs.unlink(inputPath, (err: any) => {
            if (err) logger.error(`Error deleting temp INPUT file ${inputPath}:`, { error: err.message, stack: err.stack });
            else logger.error(`Successfully cleaned up temp INPUT file: ${inputPath}`, { error: err.message, stack: err.stack });
        });
    }
};