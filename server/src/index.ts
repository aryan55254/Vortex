import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import connectdb from './config/db';
import { env } from './config/env';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieparser());

connectdb();

const PORT = env.PORT || 8080;
app.get('/', (req, res) => { res.json({ status: 'ok' }); });

app.listen(PORT, () => { console.log('Server is running!'); })