import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;
const devLogFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: process.env.NODE_ENV === 'production'
        ? combine(timestamp(), json())
        : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devLogFormat),
    transports: [new winston.transports.Console()],
});

export default logger;