import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    googleId: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },
}, { timestamps: true });

export const User = model('User', userSchema);
