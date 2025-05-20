"use client";

import React, { useState, useEffect, useRef, MutableRefObject, forwardRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    // Use typeof RQ for correct typing
    return forwardRef<InstanceType<typeof RQ>, any>((props, ref) => (
      <RQ ref={ref} {...props} />
    ));
  },
  { ssr: false }
);

import { Save, Send, Clock, CheckCircle } from "lucide-react";
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
  const { darkMode } = useTheme();
  const router = useRouter();

  const params = useParams() as { id?: string };
  const id = params?.id ?? null;

  const { user } = useAppSelector((state) => state.auth);

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
                        theme="snow"
                        value={currentBlog.content}
                        onChange={(content:any) => handleInputChange("content", content)}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Write your blog content here..."
                      />
                    )}
                    {useSimpleEditor && (
                      <SimpleMDE
                        value={currentBlog.content}
                        onChange={(content) => handleInputChange("content", content)}
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
                    placeholder="e.g. react,nextjs,webdev"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    Save Draft
                  </button>

                  <button
                    onClick={handlePublish}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Publish
                  </button>

                  {isSaving && (
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <Clock className="animate-spin h-5 w-5" />
                      <span>Saving...</span>
                    </div>
                  )}

                  {showSuccess && !isSaving && (
                    <div className="flex items-center space-x-1 text-green-500 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span>Saved successfully</span>
                    </div>
                  )}
                </div>

                {lastSaved && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Last saved at: {formatDate(lastSaved)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Blog Posts</h2>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-auto">
                {blogs.map((blog) => (
                  <li
                    key={blog.id}
                    className="py-3 cursor-pointer hover:bg-indigo-100 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => {
                      setCurrentBlog(blog);
                      setIsEditing(true);
                    }}
                  >
                    <h3 className="text-md font-semibold text-indigo-700 dark:text-indigo-400">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Status:{" "}
                      <span
                        className={`capitalize font-semibold ${
                          blog.status === "published"
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated: {blog.updatedAt ? formatDate(blog.updatedAt) : "N/A"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
