"use client";

import { Card, CardContent } from "@/components/ui/card";
import { axiosServices } from "@/lib/auth";
import { useAppSelector } from "@/lib/store";
import React, { useEffect, useState } from "react";

interface Blog {
  id: string | number;
  title: string;
  createdAt: string;
  status: string;
}

interface Profile {
  email: string;
  createdAt: string;
  blogs?: Blog[];
}

function Page() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.email) {
        setError("User email not found");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axiosServices.post<{ data: Profile }>("/auth/profile", {
          email: user.email,
        });
        // Assuming the API response has a "data" field holding the profile
        setProfile(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user?.email]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Card */}
        <Card className="w-full md:w-1/3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white dark:from-indigo-600 dark:to-purple-700 dark:text-white shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">👤 Profile</h2>
            <p className="text-sm opacity-90">Email:</p>
            <p className="text-base font-semibold">{profile?.email ?? "N/A"}</p>
            <p className="mt-4 text-sm opacity-90">Member Since:</p>
            <p className="text-base">
              {profile?.createdAt
                ? new Date(profile.createdAt).toDateString()
                : "N/A"}
            </p>

            <div className="mt-6 border-t border-white/30 pt-4">
              <p className="text-sm opacity-90">Total Blogs:</p>
              <p className="text-2xl font-bold">{profile?.blogs?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Blog List */}
        <div className="w-full md:w-2/3 space-y-4">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            📝 Your Blogs
          </h2>
          {profile?.blogs?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              You haven’t written any blogs yet.
            </p>
          ) : (
            profile?.blogs?.map((blog) => (
              <Card
                key={blog.id}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-sm transition hover:shadow-lg"
              >
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Published: {new Date(blog.createdAt).toLocaleDateString()} |{" "}
                    Status:{" "}
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      {blog.status}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
