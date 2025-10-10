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
import { get } from 'http';
import authRouter from './routes/auth.routes';
const app = express();

app.use(cors());
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

app.get('/', (req, res) => {
    res.status(200).json({ message: 'OK' });
});
app.use('/api/videos', videorouter);
app.use('/api/auth', authRouter)

app.use(errorHandler);

const PORT = env.PORT || 8080;

app.listen(PORT, () => { console.log('Server is running!'); });