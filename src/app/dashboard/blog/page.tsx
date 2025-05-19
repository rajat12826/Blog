"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { useAppSelector } from "@/lib/store";
import { axiosServices } from "@/lib/auth";
import { useTheme } from "@/lib/features/ThemeContext";

// Define a type for a Blog object
interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string;
  status: "draft" | "savedraft" | "published";
  updatedAt: string;
}

export default function BlogEditor() {
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  // Type the blogs state as an array of Blog
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/dashboard/auth/signin");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axiosServices.get<Blog[]>("/blogs", {
          params: { id: user?.id, email: user?.email },
        });
        setBlogs(res.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    if (user) {
      fetchBlogs();
    }
  }, [user]);

  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [showPublished, setShowPublished] = useState(true);
  const [showDrafts, setShowDrafts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter blogs based on search term (safe access with ?. and default empty string)
  const filteredBlogs = blogs.filter((blog) =>
    (blog.title ?? "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (blog.tags ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Correct the status filter values to match your backend values
  const publishedBlogs = filteredBlogs.filter(
    (blog) => blog.status === "published"
  );
  const draftBlogs = filteredBlogs.filter(
    (blog) => blog.status === "savedraft"
  );

  const handleEditBlog = (blog: Blog) => {
    router.push(`/dashboard/blog/${blog.id}`);
  };

  const handleDeleteBlog = (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));

      if (currentBlog?.id === id) {
        setCurrentBlog(null);
      }

      const deleteBlog = async () => {
        try {
          const res = await axiosServices.delete(`/blogs/${id}`);
          console.log(res);
        } catch (error) {
          console.error("Failed to delete blog:", error);
        }
      };
      deleteBlog();
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-white dark:from-indigo-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Your Blog Posts
              </h2>

              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-indigo-500 focus:outline-none
                         placeholder-gray-500 dark:placeholder-gray-400
                         bg-white dark:bg-gray-800
                         text-gray-900 dark:text-gray-100
                         border-gray-300 dark:border-gray-600
                         focus:ring-indigo-500"
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
                  size={18}
                />
              </div>

              <div className="mb-8">
                <div
                  className="flex items-center justify-between cursor-pointer mb-2"
                  onClick={() => setShowPublished(!showPublished)}
                >
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Published ({publishedBlogs.length})
                  </h3>
                  {showPublished ? (
                    <ChevronUp
                      size={18}
                      className="text-gray-700 dark:text-gray-300"
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="text-gray-700 dark:text-gray-300"
                    />
                  )}
                </div>

                {showPublished && (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {publishedBlogs.length > 0 ? (
                      publishedBlogs.map((blog) => (
                        <div
                          key={blog.id}
                          className="group border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {blog.title}
                            </h4>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => handleEditBlog(blog)}
                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-600"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(blog.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(blog.updatedAt)}
                          </div>
                          {blog.tags && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {blog.tags.split(",").map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-3 text-gray-500 dark:text-gray-400">
                        No published blogs found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div
                  className="flex items-center justify-between cursor-pointer mb-2"
                  onClick={() => setShowDrafts(!showDrafts)}
                >
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                    Drafts ({draftBlogs.length})
                  </h3>
                  {showDrafts ? (
                    <ChevronUp
                      size={18}
                      className="text-gray-700 dark:text-gray-300"
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="text-gray-700 dark:text-gray-300"
                    />
                  )}
                </div>

                {showDrafts && (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {draftBlogs.length > 0 ? (
                      draftBlogs.map((blog) => (
                        <div
                          key={blog.id}
                          className="group border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {blog.title}
                            </h4>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => handleEditBlog(blog)}
                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-600"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(blog.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(blog.updatedAt)}
                          </div>
                          {blog.tags && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {blog.tags.split(",").map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-3 text-gray-500 dark:text-gray-400">
                        No drafts found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {currentBlog ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                  Editing: {currentBlog.title}
                </h2>
                {/* Blog editing form goes here */}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-lg">
                Select a blog to edit or create a new one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
