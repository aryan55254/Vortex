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

const app = express();
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
};

app.use(cors(
    corsOptions
));
app.use(express.json());
app.use(cookieparser());

app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: env.MONGO_URI }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(passport.initialize());
app.use(passport.session());

connectdb();

app.use('/api/videos', videorouter);
app.use('/api/auth', authRouter)

app.use(errorHandler);

const PORT = env.PORT || 8080;

app.listen(PORT, () => { logger.info('Server Is Running'); });