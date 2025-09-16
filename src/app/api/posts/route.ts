import Post from "@/models/Post";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.id) {
        return NextResponse.json({ error: "Unauthorized, please log in." }, { status: 401 });
    }
    const body = await req.json();

    if (!body.type || !body.title || !body.category || !body.description || !body.location?.coordinates)
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    await connectDB();

    const post = await Post.create({
        type: body.type,
        category: body.category,
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        location: {
            name: body.location.name,
            type: "Point",
            coordinates: body.location.coordinates,
        },
        userId: clerkUser.id,
        reward: body.reward,
        contactMethod: body.contactMethod,
        status: "open",
    });

    return NextResponse.json(post);
}

// GET nearby posts
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));
    const maxDistance = Number(searchParams.get("maxDistance")) || 5000; // default 5km

    if (!lat || !lng) return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });

    await connectDB();

    const posts = await Post.find({
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: maxDistance,
            },
        },
        status: "open", // only open posts
    }).sort({ createdAt: -1 });

    return NextResponse.json(posts);
}
