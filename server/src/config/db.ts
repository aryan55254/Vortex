import 'dotenv/config'
import { env } from './env';
import mongoose from 'mongoose'

const mongouri = env.MONGO_URI;
const connectdb = async () => {
    mongoose.connect(mongouri).then(() => { console.log("mongo db connected to server") })
        .catch((err) => {
            console.log(`Error While Connecting To MongoDB: ${err}`);
        });

}

export default connectdb;