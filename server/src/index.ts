import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import connectdb from './config/db';
import { env } from './config/env';
import videorouter from './routes/video.routes';
import { errorHandler } from "./middlewares/errorhandler.middleware"
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import './config/passport.setup';
import authRouter from './routes/auth.routes';
import logger from './utils/logger';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { Worker, Job } from 'bullmq';
import { redisConnection } from './config/redis.config';
import { trimjobs } from './Queue/queue';
import { handlesocketevents } from './controllers/socket.handler';
import { processTrimJob } from './services/video.service';
import { SocketMiddleware, ExpressMiddleware } from "./types/types"
import { Request, Response, NextFunction } from 'express';

const app = express();
const corsOptions = {
    origin: env.CLIENT_URL,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
};

const trimsDir = path.join(__dirname, 'public', 'trims');
if (!fs.existsSync(trimsDir)) {
    logger.info(`Creating public trims directory at: ${trimsDir}`);
    fs.mkdirSync(trimsDir, { recursive: true });
}
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors(
    corsOptions
));
app.use(express.json());
app.use(cookieparser());

const sessionMiddleware = session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: env.MONGO_URI }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
});

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

connectdb();

app.use('/api/videos', videorouter);
app.use('/api/auth', authRouter)

const httpserver = createServer(app);
const io = new Server(httpserver, {
    cors: {
        origin: env.CLIENT_URL,
        credentials: true,
    }
});

const wrap = (middleware: ExpressMiddleware): SocketMiddleware => {
    return (socket: Socket, next: (err?: Error) => void) => {

        middleware(socket.request as Request, {} as Response, next as NextFunction);
    };
}

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

handlesocketevents(io);

logger.info("worker is starting");
const worker = new Worker('trim-jobs', async (Job: Job) => {
    logger.info(`Worker processing job ${Job.id} from queue `);
    const outputPath = await processTrimJob(Job.data);
    return outputPath;
}, {
    connection: redisConnection,
});
logger.info('BullMQ Worker is running.');

worker.on('completed', async (job: Job, outputPath: string) => {
    logger.info(`Job ${job.id} completed. Output at: ${outputPath}`);
    const { socketId } = job.data;
    try {
        const finalFileName = `${job.id}.mp4`;
        const finalDir = path.join(__dirname, 'public', 'trims');
        const finalOutputPath = path.join(finalDir, finalFileName);
        await fs.promises.rename(outputPath, finalOutputPath);
        logger.info(`File moved to public path: ${finalOutputPath}`);
        const downloadUrl = `/trims/${finalFileName}`;
        io.to(socketId).emit('job-completed', {
            jobId: job.id,
            downloadUrl: downloadUrl
        });

        logger.info(`File URL sent to socket ${socketId}.`);

    } catch (error) {
        logger.error(`Error processing completed job ${job.id}:`, error);
        io.to(socketId).emit('job-failed', { error: 'Failed to make file available for download.' });
    }
});

worker.on('failed', (job: Job | undefined, error: Error) => {
    if (job) {
        logger.error(`Job ${job.id} failed:`, error.message);
        const { socketId } = job.data;
        io.to(socketId).emit('job-failed', { error: error.message });
    } else {
        logger.error('job failure occurred:', error);
    }
});

app.use(errorHandler);

const PORT = env.PORT || 8080;

httpserver.listen(PORT, () => {
    logger.info('Server Is Running');
    logger.info('websockets are listening for connections');
});