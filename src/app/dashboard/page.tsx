"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/features/ThemeContext";
import { useRouter } from "next/navigation";


export default function HomePage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const router = useRouter()
  const features = [
    {
      title: "📝 Save as Draft",
      desc: "Never lose your ideas. Save them instantly and continue writing anytime.",
    },
    {
      title: "🚀 One-click Publish",
      desc: "When you're ready, publish your post with a single click — fast and seamless.",
    },
    {
      title: "⏱️ Auto-Save Magic",
      desc: "No need to click save. We store your thoughts every 30 seconds or when you pause typing.",
    },
    {
      title: "📚 Organized Blog List",
      desc: "View your published blogs and drafts separately with clean filtering and editing.",
    },
  ];

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${darkMode
          ? "bg-gradient-to-b from-zinc-900 to-black text-white"
          : "bg-white text-black"
        }`}
    >

      <section className="text-center py-24 px-6 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight"
        >
          Publish Smarter. Write Freely.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-6 text-xl max-w-2xl mx-auto ${darkMode ? "text-zinc-300" : "text-zinc-700"
            }`}
        >
          Create beautiful blog posts effortlessly. Auto-save, draft, and publish — all from one elegant interface.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <Button className="text-lg px-8 py-4 cursor-pointer" onClick={() => router.push("/dashboard/blog")}>Get Started</Button>
        </motion.div>
      </section>


      <section
        className={`py-20 px-6 transition-colors duration-300 ${darkMode ? "bg-zinc-800" : "bg-zinc-100"
          }`}
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 text-left">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className={`rounded-2xl p-6 shadow-lg transition-colors duration-300 ${darkMode ? "bg-zinc-700 text-white" : "bg-white text-black"
                }`}
            >
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className={darkMode ? "text-zinc-300" : "text-zinc-600"}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      <section className="py-20 text-center transition-colors duration-300">
        <h2 className="text-4xl font-bold mb-4">
          Start Writing. Start Publishing.
        </h2>
        <p
          className={`mb-6 ${darkMode ? "text-zinc-300" : "text-zinc-600"
            }`}
        >
          Turn your ideas into powerful stories. All it takes is a click.
        </p>
        <Button className="text-lg px-8 py-4 cursor-pointer" onClick={() => {
          router.push("/dashboard/blog/new")
        }}>Create Your First Blog</Button>
      </section>
    </main>
  );
}
