/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL as string;

if (!DATABASE_URL) {
    throw new Error("Please define the DATABASE_URL environment variable inside .env.local");
}

const cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
    if (cached.conn) {
        console.log("\nMongoDB already connected");
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(DATABASE_URL).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    console.log("\nMongoDB connected");
    return cached.conn;
}
