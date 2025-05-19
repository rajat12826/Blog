"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from 'next/dynamic';


const ReactQuill = dynamic(
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


const initialBlogs = [
  { id: 1, title: "Getting Started with Next.js", content: "Next.js is a powerful React framework...", tags: "react,nextjs,frontend", status: "published", updatedAt: "2025-05-15T10:30:00" },
  { id: 2, title: "CSS Best Practices", content: "When writing CSS, it's important to...", tags: "css,webdev", status: "published", updatedAt: "2025-05-10T14:20:00" },
  { id: 3, title: "Redux vs Context API", content: "Draft comparing state management...", tags: "react,redux,state", status: "draft", updatedAt: "2025-05-18T09:15:00" }
];


const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ color: [] }, { background: [] }],
    ['link', 'image', 'video', 'blockquote', 'code-block'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list',
  'indent',
  'link', 'image', 'video',
  'color', 'background',
  'script',
  'blockquote', 'code-block',
  'direction'
];


const SimpleMDE = dynamic(
  () => import('react-simplemde-editor').then((mod) => mod.default),
  { ssr: false }
);

export default function BlogEditor() {
  const { darkMode, toggleDarkMode } = useTheme()
  const router = useRouter();
  const { id } = useParams()
  const { user } = useAppSelector((state) => state.auth)
  console.log(user);

  const [blogs, setBlogs] = useState(initialBlogs);
  const [currentBlog, setCurrentBlog] = useState({
    id: null,
    title: "",
    content: "",
    tags: "",
    status: "draft"
  });
  useEffect(() => {
    const fetchBlogById = async () => {
      try {
        const res = await axiosServices.get(`/blogs/${id}`)
        console.log(res.data);
        // setBlogs(res.data)
        setCurrentBlog(res.data)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      }
    }
    fetchBlogById()
  }, [])


  const [isClient, setIsClient] = useState(false);
  const [useSimpleEditor, setUseSimpleEditor] = useState(false);

  useEffect(() => {

    setIsClient(true);

    try {

      import('react-quill/dist/quill.snow.css').catch(() => {
        setUseSimpleEditor(true);
      });
    } catch (err) {
      console.error("Error loading Quill:", err);
      setUseSimpleEditor(true);
    }
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const autoSaveTimerRef = useRef(null);
  const typingTimerRef = useRef(null);




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


  const handleInputChange = (field, value) => {
    setCurrentBlog(prev => ({ ...prev, [field]: value }));

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }


    typingTimerRef.current = setTimeout(() => {
      handleSaveDraft(false);
    }, 5000);
  };

  const handleSaveDraft = (showNotification = true) => {
    if (!currentBlog.title?.trim()) return;

    console.log(currentBlog.title.trim());

    setIsSaving(true);

    setTimeout(() => {
      const now = new Date().toISOString();


      const newBlog = {
        ...currentBlog,
        id: id,
        status: "savedraft",
        updatedAt: now,
        author: user?.id,
      };

      console.log(newBlog);

      const pub = async () => {
        try {
          const res = await axiosServices.post("/blogs/save-draft", newBlog);
          console.log(res);

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


      console.log(user?.id);


      const newBlog = {
        ...currentBlog,
        id: id,
        status: "published",
        updatedAt: now,
        author: user?.id
      };
      console.log(newBlog);

      const pub = async () => {
        const res = await axiosServices.post('/blogs/publish', newBlog)
        console.log(res);
      }
      pub()
      // setBlogs(prevBlogs => [...prevBlogs, newBlog]);




      setIsEditing(false);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={currentBlog.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter blog title..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>


                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <div className="border dark:bg-white border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-00 text-gray-900 dark:text-white">
                    {isClient && !useSimpleEditor && (
                      <>

                        <ReactQuill
                          forwardedRef={el => { }}
                          theme="snow"
                          value={currentBlog.content}
                          onChange={(content) => handleInputChange('content', content)}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Write your blog content here..."
                        />
                      </>
                    )}
                    {isClient && useSimpleEditor && (
                      <SimpleMDE
                        value={currentBlog.content}
                        onChange={(value) => handleInputChange('content', value)}
                        options={{
                          autofocus: false,
                          spellChecker: true,
                          placeholder: "Write your blog content here...",
                          status: ['lines', 'words'],
                        }}
                      />
                    )}
                    {!isClient && (
                      <textarea
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                        rows={10}
                        placeholder="Loading editor..."
                        disabled
                      />
                    )}
                  </div>
                </div>


                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={currentBlog.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="react, nextjs, tutorial..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>


                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleSaveDraft}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg flex items-center"
                  >
                    <Save size={18} className="mr-2" />
                    Save as Draft
                  </button>

                  <button
                    onClick={handlePublish}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center"
                  >
                    <Send size={18} className="mr-2" />
                    Publish
                  </button>

                  {isEditing && (
                    <button
                      onClick={() => {
                        setCurrentBlog({
                          id: null,
                          title: "",
                          content: "",
                          tags: "",
                          status: "draft"
                        });
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg ml-auto"
                    >
                      Cancel
                    </button>
                  )}
                </div>


                {lastSaved && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={14} className="mr-1" />
                    Last saved: {formatDate(lastSaved)}
                  </div>
                )}


                {showSuccess && (
                  <div className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-800 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 rounded shadow-md flex items-center">
                    <CheckCircle size={18} className="mr-2" />
                    {isEditing ? "Blog post updated successfully!" : "Blog post saved successfully!"}
                  </div>
                )}


                {isSaving && (
                  <div className="fixed bottom-4 right-4 bg-blue-100 dark:bg-blue-800 border-l-4 border-blue-500 text-blue-700 dark:text-blue-200 p-4 rounded shadow-md flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Saving changes...
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>

  );
}