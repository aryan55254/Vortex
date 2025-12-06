import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { env } from '../config/env';
import { LIMITS } from '../config/limit';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY
    },
    forcePathStyle: !!env.S3_ENDPOINT
});

export const StorageAdapter = {
    async getPresignedUrl(fileKey: string, contentType: string) {
        const command = new PutObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: fileKey,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 12 });


        if (env.NODE_ENV === 'development' && url.includes('minio:9000')) {
            return url.replace('minio:9000', 'localhost:9000');
        }
        return url;
    },

    async download(fileKey: string, localPath: string) {
        const command = new GetObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: fileKey
        });
        const response = await s3.send(command);
        if (!response.Body) throw new Error(`File ${fileKey} not found in bucket`);
        await pipeline(response.Body as any, fs.createWriteStream(localPath));
    },
    async upload(localPath: string, fileKey: string) {
        const fileStream = fs.createReadStream(localPath);
        const command = new PutObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: fileKey,
            Body: fileStream
        });

        await s3.send(command);
    },
    async delete(fileKey: string) {
        const command = new DeleteObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: fileKey
        });
        await s3.send(command);
    },
    async getDownloadUrl(fileKey: string) {
        const url = await getSignedUrl(
            s3,
            new GetObjectCommand({
                Bucket: env.S3_BUCKET,
                Key: fileKey
            }),
            { expiresIn: 60 * 60 * 12 }
        );

        return url;
    }
    ,
};
