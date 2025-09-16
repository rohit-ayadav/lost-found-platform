import mongoose, { Schema, Document, models } from "mongoose";

export interface IPost extends Document {
    type: "lost" | "found";
    category: string;
    title: string;
    description: string;
    imageUrl?: string;
    location: {
        name?: string;             // e.g., "Indira Nagar, Lucknow"
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
    };
    userId: string;               // Clerk User ID
    reward?: number;              // optional reward
    contactMethod?: string;       // optional override for contact info
    status: "open" | "claimed" | "resolved"; // tracking item state
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
    {
        type: { type: String, enum: ["lost", "found"], required: true },
        category: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        imageUrl: { type: String },
        location: {
            name: { type: String },
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], required: true },
        },
        userId: { type: String, required: true, ref: "User" }, // Clerk User ID
        reward: { type: Number },
        contactMethod: { type: String },
        status: { type: String, enum: ["open", "claimed", "resolved"], default: "open" },
    },
    { timestamps: true }
);

PostSchema.index({ location: "2dsphere" });

export default models.Post || mongoose.model<IPost>("Post", PostSchema);
