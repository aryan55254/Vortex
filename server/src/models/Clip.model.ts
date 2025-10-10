import { timeStamp } from "console";
import { Schema, model } from "mongoose";
import { ref } from "process";

const clipSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    originalUrl: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export const Clip = model('Clip', clipSchema);