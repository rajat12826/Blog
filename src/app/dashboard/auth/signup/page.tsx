"use client";
import { useForm } from "react-hook-form";
import { signup } from "@/lib/auth";
import { useState } from "react";
import { useTheme } from "@/lib/features/ThemeContext";

export default function SignUpForm() {
  const{darkMode,toggleDarkMode}=useTheme()
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");

  const onSubmit = async (data: any) => {
    try {
      const res = await signup(data);
      setMessage(res.data.message);
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Signup failed");
    }
  };

  return (
 <div>
     <form
    onSubmit={handleSubmit(onSubmit)}
    className="max-w-md mx-auto p-6 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl space-y-5 border border-gray-200 dark:border-gray-700"
  >
    <h2 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white">🧾 Sign Up</h2>
  
    <div>
      <input
        type="email"
        {...register("email", { required: "Email is required" })}
        placeholder="Email"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      {/* {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>} */}
    </div>
  
    <div>
      <input
        type="password"
        {...register("password", {
          required: "Password is required",
          minLength: { value: 6, message: "Password must be at least 6 characters" },
        })}
        placeholder="Password"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      {/* {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>} */}
    </div>
  
    <button
      type="submit"
      className="w-full py-2 font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition duration-200 shadow-md hover:shadow-lg"
    >
      Sign Up
    </button>
  
    {message && <p className="text-sm text-center mt-3 text-gray-600 dark:text-gray-300">{message}</p>}
  </form>
 </div>
  
  );
}
