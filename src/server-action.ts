import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "./lib/db";
import User from "./models/User";

export async function syncUser() {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    await connectDB();

    let user = await User.findOne({ clerkId: clerkUser.id });

    if (!user) {
        user = await User.create({
            clerkId: clerkUser.id,
            name: clerkUser.firstName + " " + clerkUser.lastName,
            email: clerkUser.emailAddresses[0].emailAddress,
            profileImageUrl: clerkUser.hasImage ? clerkUser.imageUrl : '',
            phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber,
        });
    }

    return user;
}