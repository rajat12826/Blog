"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
    'list', 'bullet',
    'indent',
    'link', 'image', 'video',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'direction'
];

// Alternative editor in case Quill has issues
const SimpleMDE = dynamic(
    () => import('react-simplemde-editor').then((mod) => mod.default),
    { ssr: false }
);

export default function BlogEditor() {
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useTheme()
    const { user } = useAppSelector((state) => state.auth)
    // console.log(user);
    const [len, setlen] = useState(0)
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await axiosServices.get('/blogs', {
                    params: { id: user?.id, email: user?.email },
                });
                console.log(res.data);
                setlen(res.data?.length)
            } catch (error) {
                console.error("Error fetching blogs:", error);
            }
        };
        fetchBlogs();
    }, [])

    const [currentBlog, setCurrentBlog] = useState({
        id: null,
        title: "",
        content: "",
        tags: "",
        status: "draft"
    });


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


    const [isSaving, setIsSaving] = useState(false);

    const autoSaveTimerRef = useRef(null);
    const typingTimerRef = useRef(null);



    useEffect(() => {
        if (currentBlog.title || currentBlog.content) {

            console.log(currentBlog.title || currentBlog.content);

            autoSaveTimerRef.current = setInterval(() => {
                handleSaveDraft();
            }, 10000);
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
        if (!currentBlog.title?.trim()) return;  // Make sure title is not empty

        console.log(currentBlog.title.trim());

        setIsSaving(true);

        setTimeout(() => {
            const now = new Date().toISOString();

            // Compose the blog object to send
            const newBlog = {
                ...currentBlog,
                id: currentBlog.id ? currentBlog.id : undefined, // send id only if exists (update case)
                status: "savedraft", // backend expects this exact status string
                updatedAt: now,
                author: user?.id, // must be UUID string for backend
            };

            console.log(newBlog);

            const pub = async () => {
                try {
                    const res = await axiosServices.post("/blogs/save-draft", newBlog);
                    console.log(res);
                    // Optionally, update the currentBlog with response to sync any backend changes
                    setCurrentBlog(res.data);
                } catch (error) {
                    console.error("Error saving draft:", error);
                }
            };
            pub();

            setIsEditing(true); // mark editing mode true after save

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

            if (isEditing) {

            } else {
                console.log(user?.id);


                const newBlog = {
                    ...currentBlog,

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

            }


            setCurrentBlog({
                id: null,
                title: "",
                content: "",
                tags: "",
                status: "draft"
            });

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
        <div className={`min-h-screen my-10 bg-gradient-to-b ${darkMode ? "from-zinc-900 to-zinc-800" : "from-indigo-50 to-white"}`}>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className={`${darkMode ? "bg-zinc-900 text-white" : "bg-white text-gray-800"} rounded-xl shadow-lg p-6 mb-4`}>
                            <h1 className="text-2xl font-bold mb-6">
                                {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
                            </h1>

                            <div className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="title">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={currentBlog.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="Enter blog title..."
                                        className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? "bg-zinc-800 text-white border-zinc-700" : "bg-white text-black border border-gray-300"}`}
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="content">
                                        Content
                                    </label>
                                    <div className={`${darkMode ? "border bg-white border-zinc-70 bg-zinc-80" : "border border-gray-300 bg-white"} rounded-lg`}>
                                        {isClient && !useSimpleEditor && (
                                            <>

                                                <ReactQuill
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
                                                className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-zinc-800 text-white" : "bg-white text-black"}`}
                                                rows={10}
                                                placeholder="Loading editor..."
                                                disabled
                                            />
                                        )}
                                    </div>
                                </div>


                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="tags">
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        id="tags"
                                        value={currentBlog.tags}
                                        onChange={(e) => handleInputChange('tags', e.target.value)}
                                        placeholder="react, nextjs, tutorial..."
                                        className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? "bg-zinc-800 text-white border-zinc-700" : "bg-white text-black border border-gray-300"}`}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={handleSaveDraft}
                                        className={`${darkMode ? "bg-zinc-700 hover:bg-zinc-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"} px-4 py-2 rounded-lg flex items-center`}
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
                                                    status: "draft",
                                                });
                                                setIsEditing(false);
                                            }}
                                            className={`px-4 py-2 border rounded-lg ml-auto ${darkMode ? "border-zinc-600 hover:bg-zinc-700 text-gray-300" : "border-gray-300 hover:bg-gray-100 text-gray-600"}`}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>


                                {lastSaved && (
                                    <div className={`flex items-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        <Clock size={14} className="mr-1" />
                                        Last saved: {formatDate(lastSaved)}
                                    </div>
                                )}


                                {showSuccess && (
                                    <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md flex items-center">
                                        <CheckCircle size={18} className="mr-2" />
                                        {isEditing ? "Blog post updated successfully!" : "Blog post saved successfully!"}
                                    </div>
                                )}

                                {isSaving && (
                                    <div className="fixed bottom-4 right-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-md flex items-center">
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