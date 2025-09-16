import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
    clerkId: string;       // Clerk User ID
    name?: string;
    email?: string;
    phoneNumber?: string;
    profileImageUrl?: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    clerkId: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    profileImageUrl: { type: String },
}, { timestamps: true });

export default models.User || mongoose.model<IUser>("User", UserSchema);
