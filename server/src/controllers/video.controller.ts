import { VideoInfoResponse, GetVideoInfoRequestBody, VideoFormat } from '../types/types';
import { getVideoInfo } from '../services/video.service'
import { Request, Response, NextFunction } from 'express';

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

