import 'dotenv/config'
import { env } from './env';
import mongoose from 'mongoose'
import logger from '../utils/logger';

const mongouri = env.MONGO_URI;
const connectdb = async () => {
    mongoose.connect(mongouri).then(() => { logger.info("mongo db connected to server") })
        .catch((err) => {
            logger.error(`Error While Connecting To MongoDB`, { error: err.message, stack: err.stack });
        });

}

export default connectdb;