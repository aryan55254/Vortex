import { VideoFormat, VideoInfoResponse } from '../types/types';
import { spawn } from 'child_process';
import { Response } from 'express';
import https from 'https';

const runSpawnCommand = (command: string, args: string[]): Promise<string> => {
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