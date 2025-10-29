import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';

export interface VideoFormat {
    formatId: string;
    resolution: string;
    ext: string;
}
export interface VideoInfoResponse {
    title: string;
    thumbnail: string;
    duration: number;
    formats: VideoFormat[];
}
export interface GetVideoInfoRequestBody {
    url: string;
}
export type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;
export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;
