import { Schema, model, Document } from 'mongoose';
export interface IUser extends Document {
    googleId: string;
    displayName: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin';
}

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
        unique: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
