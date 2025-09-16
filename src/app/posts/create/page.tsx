/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function CreatePostPage() {
    const { isSignedIn, userId } = useAuth();
    const router = useRouter();

    const [type, setType] = useState<"lost" | "found">("lost");
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [coords, setCoords] = useState<[number, number] | null>(null);
    const [locationName, setLocationName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Request user location
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => setCoords([position.coords.longitude, position.coords.latitude]),
                () => console.log("Location access denied")
            );
        }
    }, []);

    if (!isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !category || !description || !coords) {
            setError("Please fill all required fields and provide location.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    category,
                    title,
                    description,
                    imageUrl,
                    location: { name: locationName, coordinates: coords },
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create post");
            }

            router.push("/"); // redirect to homepage
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
            {error && <p className="text-red-500 mb-2">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div>
                    <label className="block mb-1 font-medium">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as "lost" | "found")}
                        className="w-full border p-2 rounded"
                    >
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                    </select>
                </div>

                {/* Category */}
                <div>
                    <label className="block mb-1 font-medium">Category</label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder="e.g., Mobile, Bag"
                        required
                    />
                </div>

                {/* Title */}
                <div>
                    <label className="block mb-1 font-medium">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border p-2 rounded"
                        rows={4}
                        required
                    />
                </div>

                {/* Image URL */}
                <div>
                    <label className="block mb-1 font-medium">Image URL (optional)</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder="Paste image URL"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block mb-1 font-medium">Location Name (optional)</label>
                    <input
                        type="text"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder="e.g., Indira Nagar, Lucknow"
                    />
                    {!coords && (
                        <p className="text-sm text-gray-500 mt-1">Your browser location is not detected.</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-500 text-white p-2 rounded mt-2"
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Post"}
                </button>
            </form>
        </div>
    );
}
