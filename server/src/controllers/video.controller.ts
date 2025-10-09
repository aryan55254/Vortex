import { VideoInfoResponse, GetVideoInfoRequestBody, VideoFormat } from '../types/types';
import { getVideoInfo, streamFullVideo, processandtrimvideo } from '../services/video.service'
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

export const getvideoinfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { url } = req.body as GetVideoInfoRequestBody;
        if (!url) {
            res.status(400).json("URL is required in the request body.");
            return;
        }
        const videoinfo: VideoInfoResponse = await getVideoInfo(url);
        res.status(200).json(videoinfo);
    }
    catch (err) {
        next(err);
    }
};
export const handlefulldownload = async (req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        res.setHeader('Content-Disposition', 'attachment; filename="vortex-download.mp4"');
        res.setHeader('Content-Type', 'video/mp4');
        const { url, formatId } = req.body;
        if (!url || !formatId) {
            res.status(400).json("URL and FormatId both are required in the request body.");
            return;
        }
        await streamFullVideo(url, formatId, res);
    }
    catch (err) {
        next(err);
    }
};

export const handleTrimVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let trimmedFilePath: string | null = null;
    try {
        res.setHeader('Content-Disposition', 'attachment; filename="vortex-download.mp4"');
        res.setHeader('Content-Type', 'video/mp4');
        const { url, formatId, startTime, endTime } = req.body;

        if (!url || !formatId || !startTime || !endTime) {
            res.status(400).json({ message: "URL, formatId, startTime, and endTime are all required." });
            return;
        }

        trimmedFilePath = await processandtrimvideo({ url, formatId, startTime, endTime });

        res.download(trimmedFilePath, 'vortex-clip.mp4', (err) => {
            if (err) {

                console.error("Error during file download:", err);
                if (!res.headersSent) {
                    next(err);
                }
            }
            if (trimmedFilePath) {
                fs.unlink(trimmedFilePath, (unlinkErr) => {
                    if (unlinkErr) console.error(`Error deleting temp file ${trimmedFilePath}:`, unlinkErr);
                    else console.log(`Successfully cleaned up temp file: ${trimmedFilePath}`);
                });
            }
        });

    } catch (error) {
        if (trimmedFilePath) {
            fs.unlink(trimmedFilePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error during cleanup after failure:', unlinkErr);
            });
        }
        next(error);
    }
};