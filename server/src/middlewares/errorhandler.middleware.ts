import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred.'
        : err.message;
    console.error(err);

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};