import { rejects } from 'assert';
import { VideoFormat, VideoInfoResponse } from '../types/types';
import { spawn } from 'child_process';
import { Response } from 'express';
import https from 'https';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

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

    } catch (error) {
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
        console.error(`Error executing yt-dlp for URL: ${url}`, err);
        throw new Error(`Failed to fetch metadata. The URL might be invalid or unsupported.`);
    }

};

export const streamFullVideo = (url: string, format_id: string, res: Response): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const directVideoUrl = await getDirectUrl(url, format_id);
            const request = https.get(directVideoUrl, (downloadstream) => {
                downloadstream.on('error', (error) => {
                    console.error('Error with the download stream:', error);
                    reject(error);
                });

                downloadstream.pipe(res);

                res.on('finish', () => {
                    resolve();
                });
                res.on('close', () => {
                    console.log('Client closed connection early.');
                    downloadstream.destroy();
                    resolve();
                });
            });
            request.on('error', (error) => {
                console.error('Error making the initial GET request:', error);
                reject(error);
            });

        }
        catch (error) {
            console.error(`Error in streamFullVideo for URL: ${url}`, error);
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

    console.log(`Generated temp paths. Input: ${inputPath}, Output: ${outputPath}`);
    try {
        console.log('Getting direct video URL...');
        const directUrl = await getDirectUrl(options.url, options.formatId);
        console.log('Downloading full video to server...');
        await downloadFile(directUrl, inputPath);
        console.log('Download complete.');
        console.log('Starting ffmpeg trim process...');
        const ffmpegArgs = [
            '-i', inputPath,
            '-ss', options.startTime,
            '-to', options.endTime,
            '-c', 'copy',
            outputPath
        ];
        await runSpawnCommand('ffmpeg', ffmpegArgs);
        console.log('FFmpeg trim process completed.');
        return outputPath;
    }
    finally {
        fs.unlink(inputPath, (err) => {
            if (err) console.error(`Error deleting temp INPUT file ${inputPath}:`, err);
            else console.log(`Successfully cleaned up temp INPUT file: ${inputPath}`);
        });
    }
};