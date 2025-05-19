"use client";

import React, { useState, useEffect, useRef, MutableRefObject } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ReactQuill = dynamic<
  {
    forwardedRef: MutableRefObject<any> | ((instance: any) => void) | null;
    value: string;
    onChange: (content: string) => void;
    modules: object;
    formats: string[];
    placeholder?: string;
    theme: string;
  }
>(
  async () => {
    const { default: RQ } = await import("react-quill-new");

    return function comp({ forwardedRef, ...props }) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false }
);

import {
  Save,
  Send,
  Clock,
  CheckCircle,
} from "lucide-react";
import { axiosServices } from "@/lib/auth";
import { useAppSelector } from "@/lib/store";
import { useTheme } from "@/lib/features/ThemeContext";

interface Blog {
  id: number | null | string;
  title: string;
  content: string;
  tags: string;
  status: string;
  updatedAt?: string;
  author?: string | number;
}

const initialBlogs: Blog[] = [
  {
    id: 1,
    title: "Getting Started with Next.js",
    content: "Next.js is a powerful React framework...",
    tags: "react,nextjs,frontend",
    status: "published",
    updatedAt: "2025-05-15T10:30:00",
  },
  {
    id: 2,
    title: "CSS Best Practices",
    content: "When writing CSS, it's important to...",
    tags: "css,webdev",
    status: "published",
    updatedAt: "2025-05-10T14:20:00",
  },
  {
    id: 3,
    title: "Redux vs Context API",
    content: "Draft comparing state management...",
    tags: "react,redux,state",
    status: "draft",
    updatedAt: "2025-05-18T09:15:00",
  },
];

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

const SimpleMDE = dynamic(() => import("react-simplemde-editor").then((mod) => mod.default), {
  ssr: false,
});

export default function BlogEditor() {
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  // useParams returns a readonly object or undefined. Fix with optional chaining + string
  const params = useParams() as { id?: string };
  const id = params?.id ?? null;

  const { user } = useAppSelector((state) => state.auth);
  // console.log(user);

  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [currentBlog, setCurrentBlog] = useState<Blog>({
    id: null,
    title: "",
    content: "",
    tags: "",
    status: "draft",
  });

  useEffect(() => {
    if (!id) return;

    const fetchBlogById = async () => {
      try {
        const res = await axiosServices.get<Blog>(`/blogs/${id}`);
        setCurrentBlog(res.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogById();
  }, [id]);

  const [isClient, setIsClient] = useState(false);
  const [useSimpleEditor, setUseSimpleEditor] = useState(false);

  useEffect(() => {
    setIsClient(true);

    import("react-quill/dist/quill.snow.css").catch(() => {
      setUseSimpleEditor(true);
    });
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentBlog.title || currentBlog.content) {
      autoSaveTimerRef.current = setInterval(() => {
        handleSaveDraft();
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
    // Only run when currentBlog changes
  }, [currentBlog]);

  const handleInputChange = (field: keyof Blog, value: string) => {
    setCurrentBlog((prev) => ({ ...prev, [field]: value }));

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      handleSaveDraft(false);
    }, 5000);
  };

  const handleSaveDraft = (showNotification = true) => {
    if (!currentBlog.title?.trim()) return;

    setIsSaving(true);

    setTimeout(() => {
      const now = new Date().toISOString();

      const newBlog: Blog = {
        ...currentBlog,
        id: id ?? currentBlog.id,
        status: "savedraft",
        updatedAt: now,
        author: user?.id,
      };

      const pub = async () => {
        try {
          const res = await axiosServices.post("/blogs/save-draft", newBlog);
          setCurrentBlog(res.data);
        } catch (error) {
          console.error("Error saving draft:", error);
        }
      };
      pub();

      setIsEditing(true);
      setLastSaved(new Date());
      setIsSaving(false);

      if (showNotification) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }, 800);
  };

  const handlePublish = () => {
    if (!currentBlog.title.trim()) return;

    setIsSaving(true);

    setTimeout(() => {
      const now = new Date().toISOString();

      const newBlog: Blog = {
        ...currentBlog,
        id: id ?? currentBlog.id,
        status: "published",
        updatedAt: now,
        author: user?.id,
      };

      const pub = async () => {
        try {
          const res = await axiosServices.post("/blogs/publish", newBlog);
          console.log(res);
        } catch (error) {
          console.error("Error publishing blog:", error);
        }
      };
      pub();

      setIsEditing(false);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const formatDate = (dateString: Date | string) => {
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
    <div className="min-h-screen my-10 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
              </h1>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={currentBlog.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter blog title..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Content
                  </label>
                  <div className="border dark:bg-white border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-00 text-gray-900 dark:text-white">
                    {isClient && !useSimpleEditor && (
                      <ReactQuill
                        forwardedRef={null}
                        theme="snow"
                        value={currentBlog.content}
                        onChange={(content) => handleInputChange("content", content)}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Write your blog content here..."
                      />
                    )}
                    {isClient && useSimpleEditor && (
                      <SimpleMDE
                        value={currentBlog.content}
                        onChange={(value) => handleInputChange("content", value)}
                        options={{
                          spellChecker: false,
                          placeholder: "Write your blog content here...",
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={currentBlog.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    placeholder="e.g. react, nextjs, webdev"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Save size={20} />
                    Save Draft
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSaving || !currentBlog.title.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Send size={20} />
                    Publish
                  </button>

                  {isSaving && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Clock size={18} className="animate-spin" />
                      Saving...
                    </div>
                  )}

                  {showSuccess && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={18} />
                      Saved Successfully
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Your Blogs
              </h2>
              <ul className="space-y-4 max-h-[600px] overflow-y-auto">
                {blogs.map((blog) => (
                  <li
                    key={blog.id?.toString()}
                    className={`p-4 rounded-lg border cursor-pointer
                      ${
                        blog.status === "draft"
                          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900"
                          : "border-green-500 bg-green-50 dark:bg-green-900"
                      }
                    `}
                    onClick={() => router.push(`/blogs/${blog.id}`)}
                  >
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Last Updated:{" "}
                      {blog.updatedAt ? formatDate(blog.updatedAt) : "N/A"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
