import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { QueueEvents } from 'bullmq';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import { env } from './common/config/env';
import { VIDEO_QUEUE_NAME } from './modules/video/video.queue';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { videoQueue } from './modules/video/video.queue';
import './modules/auth/passport.setup';
import connectdb from './common/config/db';
import cors from 'cors'

// Routes
import videoRoutes from './modules/video/video.routes';
import authRoutes from './modules/auth/auth.routes';
import { isAdmin } from './common/middlewares/auth.middleware';

const app = express();
const httpServer = createServer(app);

app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

connectdb();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [new BullMQAdapter(videoQueue)],
    serverAdapter: serverAdapter,
});

app.use('/admin/queues', isAdmin, serverAdapter.getRouter());

const sessionMiddleware = session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
});

app.use(express.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());


app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true }
});

const wrap = (middleware: any) => (socket: Socket, next: any) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));


io.use((socket: any, next) => {
    if (socket.request.user) {
        next();
    } else {
        next(new Error('Unauthorized'));
    }
});

io.on('connection', (socket) => {
    const user = (socket.request as any).user;
    console.log(`User connected: ${user.displayName} (${user._id})`);


    socket.join(user._id.toString());
});

const queueEvents = new QueueEvents(VIDEO_QUEUE_NAME, {
    connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD
    }
});

queueEvents.on('progress', ({ jobId, data }) => {
    io.emit(`job-progress-${jobId}`, data);
});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
    io.emit(`job-completed-${jobId}`, returnvalue);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
    io.emit(`job-failed-${jobId}`, { error: failedReason });
});

queueEvents.on('waiting', ({ jobId }) => {
    io.emit(`job-queued-${jobId}`, { status: 'queued' });
});

httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});