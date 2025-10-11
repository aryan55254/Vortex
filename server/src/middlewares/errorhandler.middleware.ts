import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { env } from "../config/env";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An internal server error occurred.';
    logger.error(message, {
        statusCode,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    const responseMessage = env.NODE_ENV === 'production'
        ? 'An unexpected error occurred.'
        : err.message;
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: responseMessage,
    });
};