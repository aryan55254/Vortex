import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { StorageAdapter } from '../../common/adapters/storage.adapter';
import { videoQueue } from './video.queue';
import { LIMITS } from '../../common/config/limit';

export const initializeUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { contentType, fileSize } = req.body;

        if (!LIMITS.ALLOWED_FORMATS.includes(contentType)) {
            res.status(400).json({ error: 'Invalid file type. Only MP4, MOV, MKV, AVI allowed.' });
            return;
        }
        if (fileSize > LIMITS.MAX_VIDEO_SIZE) {
            res.status(400).json({ error: `File too large. Max ${LIMITS.MAX_VIDEO_SIZE / 1024 / 1024}MB.` });
            return;
        }

        const ext = contentType.split('/')[1];
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

        if (!fileKey) {
            res.status(400).json({ error: 'fileKey is required.' });
            return;
        }

        // Add to BullMQ
        const job = await videoQueue.add('process-video', {
            fileKey,
            processingOptions,
            userId: (req.user as any)?.id || 'guest'
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