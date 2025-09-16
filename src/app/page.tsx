"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Post {
  _id: string;
  type: "lost" | "found";
  category: string;
  title: string;
  description: string;
  imageUrl?: string;
  location: { name?: string; coordinates: [number, number] };
  userId: string;
}

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [manualLocation, setManualLocation] = useState("");

  // Request user location
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords([position.coords.longitude, position.coords.latitude]);
      },
      () => {
        setLocationDenied(true);
      }
    );
  }, []);

  // Fetch nearby posts
  useEffect(() => {
    if (!coords) return;
    fetchPosts(coords[0], coords[1]);
  }, [coords]);

  const fetchPosts = async (lng: number, lat: number) => {
    try {
      const res = await fetch(`/api/posts?lng=${lng}&lat=${lat}&maxDistance=5000`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle manual location input (example: city to lat/lng conversion)
  const handleManualLocation = async () => {
    if (!manualLocation) return;
    // TODO: Call a geocoding API (Google Maps / OpenStreetMap) to get lat/lng
    // For example purpose, we'll assume some coordinates
    const lat = 26.8467; // Lucknow lat
    const lng = 80.9462; // Lucknow lng
    setCoords([lng, lat]);
  };

  if (locationDenied && !coords) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-500 mb-4">Location access denied. Enter your city/pincode manually.</p>
        <input
          type="text"
          placeholder="Enter your city/pincode"
          className="border p-2 rounded mb-4 w-full max-w-sm"
          value={manualLocation}
          onChange={(e) => setManualLocation(e.target.value)}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleManualLocation}
        >
          Submit
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nearby Lost & Found Posts</h1>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => router.push("/posts/create")}
        >
          + Create Post
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts found near your location.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="border p-4 rounded shadow hover:shadow-lg transition"
            >
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded mb-2"
                />
              )}
              <p className="text-sm text-gray-500">{post.category.toUpperCase()}</p>
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-700">{post.description}</p>
              {post.location.name && (
                <p className="text-gray-400 mt-1 text-sm">Location: {post.location.name}</p>
              )}
              <p className="mt-2 text-sm font-medium">
                Status: {post.type === "lost" ? "Lost" : "Found"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
