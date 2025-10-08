import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import connectdb from './config/db';
import { env } from './config/env';
import videorouter from './routes/video.routes';
import { errorHandler } from "./middlewares/errorhandler.middleware"

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieparser());

connectdb();

app.use('/api/videos', videorouter);

app.use(errorHandler);

const PORT = env.PORT || 8080;

app.listen(PORT, () => { console.log('Server is running!'); });