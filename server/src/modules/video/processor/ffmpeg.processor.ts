import { spawn } from 'child_process';
import logger from '../../../common/utils/logger';

interface ProcessingOptions {
    trim?: { start: number; end: number };
    format?: string;
    resolution?: string;
}

export const FfmpegProcessor = {
    processFile: (inputPath: string, outputPath: string, options: ProcessingOptions): Promise<void> => {
        return new Promise((resolve, reject) => {
            const args = [
                '-y',
                '-i', inputPath,
            ];

            if (options.trim) {
                args.push('-ss', options.trim.start.toString());
                args.push('-to', options.trim.end.toString());
            }
            if (options.resolution) {
                args.push('-vf', `scale=${options.resolution}`);
            } else {
                args.push('-vf', 'scale=1280:720');
            }
            args.push('-c:a', 'copy');
            args.push(outputPath);

            logger.info(`Spawn FFmpeg: ffmpeg ${args.join(' ')}`);

            const process = spawn('ffmpeg', args);

            process.stderr.on('data', (data) => {
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    logger.error(`FFmpeg exited with code ${code}`);
                    reject(new Error(`FFmpeg failed with code ${code}`));
                }
            });

            process.on('error', (err) => {
                logger.error('Failed to start FFmpeg process:', err);
                reject(err);
            });
        });
    }
};