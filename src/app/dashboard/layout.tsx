"use client";

import { useTheme } from '@/lib/features/ThemeContext';
import useAuthRedirect from '@/lib/features/useAuthRedirect';
import { store } from '@/lib/store';
import {
  Bell, ChevronDown, FileText, LogOut, Menu, Moon,
  PenTool, Search, Sun, User, X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New comment on your blog post", time: "2 hours ago", read: false },
    { id: 2, text: "Your draft was auto-saved", time: "Yesterday", read: true }
  ]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [u, setu] = useState<any>(null)
  
  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   setUser(storedUser);

  //   const publicPaths = ["/dashboard/auth/signin", "/dashboard/auth/signup"];

  //   // If user not logged in AND current path is not in publicPaths, redirect to signin
  //   if (!storedUser && !publicPaths.includes(router.pathname)) {
  //     router.push("/dashboard/auth/signin");
  //   }
  // }, [router.pathname]);
  const user = useAuthRedirect();

  const handleLogout = () => {
    localStorage.removeItem("user");
    // setUser(null);
    router.push("/dashboard/auth/signin");
  };




  return (
    <Provider store={store}>

      <div className={darkMode ? 'dark' : ''}>


        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {
            u != "" &&
            <div>
              <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-10">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 dark:text-gray-300 cursor-pointer">
                      {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <h1 className="ml-3 font-bold text-xl text-indigo-700 dark:text-white">Blog</h1>
                  </div>
                  <div className="flex items-center ">

                    {darkMode ? <div onClick={toggleDarkMode} className='cursor-pointer'>
                      <Sun className='text-white'></Sun>
                    </div> : <div onClick={toggleDarkMode} className='cursor-pointer'>
                      <Moon > </Moon></div>}
                    <button onClick={() => setNotificationOpen(!notificationOpen)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative">
                      <Bell size={20} />
                      {notifications.some(n => !n.read) && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                    <div className="ml-2 relative">
                      <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User size={16} className="text-indigo-600" />
                        </div>
                      </button>
                      {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white  rounded-md shadow-lg py-1 z-20">
                          <div className="px-4 py-2 border-b border-gray-100 ">
                            <p className="text-sm font-medium">{user?.email}</p>
                          </div>
                          <Link href="/dashboard/auth/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 " onClick={() => setUserMenuOpen(false)}>Your Profile</Link>

                          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ">Sign out</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {notificationOpen && (
                <div className="lg:hidden fixed z-20 top-14 right-4 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <p className="font-medium">Notifications</p>
                    <button className="text-sm text-indigo-600">Mark all as read</button>
                  </div>
                  {notifications.map(notification => (
                    <div key={notification.id} className={`px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900' : ''}`}>
                      <p className="text-sm">{notification.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                  } ${darkMode ? "bg-zinc-900 text-white" : "bg-white text-black"}`}
              >
                <div
                  className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-zinc-700" : "border-gray-200"
                    }`}
                >
                  <div className="flex items-center">
                    <FileText size={24} className={`${darkMode ? "text-zinc-300" : "text-zinc-600"}`} />
                    <h1 className="ml-2 font-bold text-xl">Blog</h1>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`${darkMode ? "text-zinc-300 hover:text-white" : "text-gray-600 hover:text-black"} lg:hidden`}
                  >
                    <X size={24} />
                  </button>
                </div>

                <nav className="mt-6 px-4">
                  {[
                    { href: "/dashboard", label: "Dashboard", icon: <FileText size={20} className="mr-3" /> },
                    { href: "/dashboard/blog", label: "My Blogs", icon: <FileText size={20} className="mr-3" /> },
                    { href: "/dashboard/blog/new", label: "New Blog", icon: <PenTool size={20} className="mr-3" /> },
                    { href: "/dashboard/auth/profile", label: "Profile", icon: <User size={20} className="mr-3" /> },

                  ].map(({ href, label, icon }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center py-3 px-4 rounded-lg mb-2 ${pathname === href
                          ? `${darkMode ? "bg-zinc-800 text-white" : "bg-zinc-100 text-black"}`
                          : `${darkMode ? "text-zinc-300 hover:bg-zinc-800 hover:text-white" : "text-gray-600 hover:bg-gray-100 hover:text-black"}`
                        }`}
                    >
                      {icon}
                      <span>{label}</span>
                    </Link>
                  ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <button
                    onClick={handleLogout}
                    className={`flex items-center py-3 px-4 rounded-lg w-full ${darkMode
                        ? "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-black"
                      }`}
                  >
                    <LogOut size={20} className="mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>


              <div className="hidden lg:block fixed top-0 left-64 right-0 bg-white dark:bg-gray-800 shadow-sm z-10">
                <div className="h-16 px-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="relative w-64">
                      <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button onClick={toggleDarkMode} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setNotificationOpen(!notificationOpen)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative">
                      <Bell size={20} />
                      {notifications.some(n => !n.read) && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                    </button>
                    <div className="relative">
                      <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User size={16} className="text-indigo-600" />
                        </div>
                        <ChevronDown size={16} className="ml-1 text-gray-500" />
                      </button>
                      {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white  rounded-md shadow-lg py-1 z-20">
                          <div className="px-4 py-2 border-b border-gray-100 ">
                            <p className="text-sm font-medium">{user?.email}</p>
                          </div>
                          <Link href="/dashboard/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 " onClick={() => setUserMenuOpen(false)}>Your Profile</Link>

                          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ">Sign out</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }


          <div className="lg:pl-64 pt-16 p-4">
            {children}
          </div>
        </div>
      </div>

    </Provider>
  );
}
