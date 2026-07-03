import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { UserRole } from "@/types";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    emailVerified: boolean;
    verificationCode: string | null;
    verificationCodeExpiry: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        emailVerified: { type: Boolean, default: false },
        verificationCode: { type: String, default: null },
        verificationCodeExpiry: { type: Date, default: null },
    },
    { timestamps: true }
);

const User: Model<IUser> =
    (mongoose.models.User as Model<IUser>) ||
    mongoose.model<IUser>("User", UserSchema);

export default User;
