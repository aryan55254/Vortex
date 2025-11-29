import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { StorageAdapter } from '../../common/adapters/storage.adapter';
import { videoQueue } from './video.queue';
import { LIMITS } from '../../common/config/limit';
import * as mime from 'mime-types';

export const initializeUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { contentType, fileSize } = req.body;

        if (!LIMITS.ALLOWED_FORMATS.includes(contentType)) {
            res.status(400).json({ error: 'Invalid file type.' });
            return;
        }

        if (fileSize > LIMITS.MAX_VIDEO_SIZE) {
            res.status(400).json({ error: 'File too large.' });
            return;
        }
        const ext = mime.extension(contentType) || 'bin';

        const fileKey = `uploads/${(req.user as any)?.id || 'guest'}/${uuidv4()}.${ext}`;

        const uploadUrl = await StorageAdapter.getPresignedUrl(fileKey, contentType);

        res.json({
            uploadUrl,
            fileKey,
            expiresIn: 3600
        });

    } catch (error) {
        next(error);
    }
};


export const submitProcessingJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileKey, processingOptions } = req.body;
        const userId = (req.user as any)?.id;

        if (!fileKey) {
            res.status(400).json({ error: 'fileKey is required.' });
            return;
        }
        if (!userId || !fileKey.startsWith(`uploads/${userId}/`)) {
            res.status(403).json({ error: 'Forbidden: fileKey does not belong to this user.' });
            return;
        }


        // Add to BullMQ
        const job = await videoQueue.add('process-video', {
            fileKey,
            processingOptions,
            userId: userId
        }, {
            priority: 2
        });

        res.json({
            message: 'Processing started',
            jobId: job.id
        });

    } catch (error) {
        next(error);
    }
};