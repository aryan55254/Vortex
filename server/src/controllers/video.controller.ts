import { VideoInfoResponse, GetVideoInfoRequestBody, VideoFormat } from '../types/types';
import { getVideoInfo, streamFullVideo } from '../services/video.service'
import { Request, Response, NextFunction, response } from 'express';

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