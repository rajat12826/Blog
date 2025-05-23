"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';

import { Save, Send, Clock, CheckCircle } from "lucide-react";

import { axiosServices } from "@/lib/auth";
import { useAppSelector } from "@/lib/store";
import { useTheme } from "@/lib/features/ThemeContext";

// Dynamically import ReactQuill with forwarding ref
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    // Forward ref correctly to ReactQuill
    return React.forwardRef<any, any>((props, ref) => <RQ ref={ref} {...props} />);
  },
  { ssr: false }
);

// Dynamically import SimpleMDE as fallback
const SimpleMDE = dynamic(() => import("react-simplemde-editor").then((mod) => mod.default), {
  ssr: false,
});

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    ["link", "image", "video", "blockquote", "code-block"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "background",
  "script",
  "blockquote",
  "code-block",
  "direction",
];

// Blog type definition
interface Blog {
  id: string | null;
  title: string;
  content: string;
  tags: string;
  status: "draft" | "savedraft" | "published";
  updatedAt?: string;
  author?: string | null;
}

export default function BlogEditor() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { user } = useAppSelector((state) => state.auth);

  const [len, setLen] = useState<number>(0);

  const [currentBlog, setCurrentBlog] = useState<Blog>({
    id: null,
    title: "",
    content: "",
    tags: "",
    status: "draft",
  });

  const [isClient, setIsClient] = useState(false);
  const [useSimpleEditor, setUseSimpleEditor] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch blogs count on mount
  useEffect(() => {
    if (!user?.id || !user?.email) return;

    const fetchBlogs = async () => {
      try {
        const res = await axiosServices.get("/blogs", {
          params: { id: user.id, email: user.email },
        });
        setLen(res.data?.length ?? 0);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, [user?.id, user?.email]);

  // Load Quill CSS & toggle fallback if fails
  // useEffect(() => {
  //   setIsClient(true);
  //   import("react-quill/dist/quill.snow.css").catch(() => {
  //     setUseSimpleEditor(true);
  //   });
  // }, []);

  // Auto-save interval for draft
  useEffect(() => {
    if (!currentBlog.title && !currentBlog.content) return;

    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setInterval(() => {
      handleSaveDraft(false);
    }, 10000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [currentBlog]);

  // Input change handler
  const handleInputChange = (field: keyof Blog, value: string) => {
    setCurrentBlog((prev) => ({ ...prev, [field]: value }));

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      handleSaveDraft(false);
    }, 5000);
  };

  // Save draft handler
  const handleSaveDraft = (showNotification = true) => {
    if (!currentBlog.title.trim()) return;

    setIsSaving(true);

    setTimeout(async () => {
      const now = new Date().toISOString();

      const newBlog: Blog = {
        ...currentBlog,
        id: currentBlog.id ?? null,
        status: "savedraft",
        updatedAt: now,
        author: user?.id ?? null,
      };

      try {
        const res = await axiosServices.post("/blogs/save-draft", newBlog);
        setCurrentBlog(res.data);
        setIsEditing(true);
        setLastSaved(new Date());
        if (showNotification) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      } catch (error) {
        console.error("Error saving draft:", error);
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  // Publish handler
  const handlePublish = () => {
    if (!currentBlog.title.trim()) return;

    setIsSaving(true);

    setTimeout(async () => {
      const now = new Date().toISOString();

      const newBlog: Blog = {
        ...currentBlog,
        status: "published",
        updatedAt: now,
        author: user?.id ?? null,
      };

      try {
        await axiosServices.post("/blogs/publish", newBlog);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Reset the editor
        setCurrentBlog({
          id: null,
          title: "",
          content: "",
          tags: "",
          status: "draft",
        });
        setIsEditing(false);
      } catch (error) {
        console.error("Error publishing blog:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

  const formatDate = (dateString: string | Date) => {
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
    <div
      className={`min-h-screen my-10 bg-gradient-to-b ${
        darkMode ? "from-zinc-900 to-zinc-800" : "from-indigo-50 to-white"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div
              className={`${
                darkMode ? "bg-zinc-900 text-white" : "bg-white text-gray-800"
              } rounded-xl shadow-lg p-6 mb-4`}
            >
              <h1 className="text-2xl font-bold mb-6">
                {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
              </h1>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                    htmlFor="title"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={currentBlog.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("title", e.target.value)
                    }
                    placeholder="Enter blog title..."
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      darkMode
                        ? "bg-zinc-800 text-white border-zinc-700"
                        : "bg-white text-black border border-gray-300"
                    }`}
                  />
                </div>

                {/* Content */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                    htmlFor="content"
                  >
                    Content
                  </label>
                  <div
                    className={`border rounded-lg ${
                      darkMode ? "border-zinc-700 bg-white text-black" : "border-gray-300 bg-white text-black"
                    }`}
                  >
                    {(
                      <ReactQuill
                        theme="snow"
                        value={currentBlog.content}
                        onChange={(content: string) => handleInputChange("content", content)}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Write your blog content here..."
                      />
                    )}

                 

                    {/* {!isClient && (
                      <textarea
                        className={`w-full px-4 py-2 rounded-lg ${
                          darkMode ? "bg-zinc-800 text-white" : "bg-white text-black"
                        }`}
                        rows={10}
                        placeholder="Loading editor..."
                        disabled
                      />
                    )} */}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                    htmlFor="tags"
                  >
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={currentBlog.tags}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("tags", e.target.value)
                    }
                    placeholder="e.g., tech, programming, javascript"
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      darkMode
                        ? "bg-zinc-800 text-white border-zinc-700"
                        : "bg-white text-black border border-gray-300"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleSaveDraft(true)}
                disabled={isSaving}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                <Save size={18} />
                Save Draft
              </button>

              <button
                onClick={handlePublish}
                disabled={isSaving || !currentBlog.title.trim()}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition ${
                  isSaving || !currentBlog.title.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <Send size={18} />
                Publish
              </button>
            </div>

            {/* Save info */}
            <div className="mt-3 text-sm flex items-center gap-2">
              {isSaving && (
                <span className={`flex items-center gap-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <Clock size={16} className="animate-spin" />
                  Saving...
                </span>
              )}

              {!isSaving && lastSaved && (
                <span
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-green-400" : "text-green-700"
                  }`}
                >
                  <CheckCircle size={16} />
                  Saved at {formatDate(lastSaved)}
                </span>
              )}

              {showSuccess && !isSaving && (
                <span
                  className={`ml-auto font-medium ${
                    darkMode ? "text-green-400" : "text-green-700"
                  }`}
                >
                  Changes saved successfully!
                </span>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div
              className={`sticky top-24 p-4 rounded-xl shadow-lg ${
                darkMode ? "bg-zinc-900 text-white" : "bg-white text-gray-800"
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">Blog Info</h3>
              <p>Total blogs: <strong>{len}</strong></p>
              <p>Status: <strong>{currentBlog.status}</strong></p>
              {currentBlog.updatedAt && (
                <p>Last updated: <strong>{formatDate(currentBlog.updatedAt)}</strong></p>
              )}
              {currentBlog.author && <p>Author ID: <strong>{currentBlog.author}</strong></p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
