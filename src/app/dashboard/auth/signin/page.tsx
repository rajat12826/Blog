"use client";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/store";
import { login } from "@/lib/features/authslice";
import { useTheme } from "@/lib/features/ThemeContext";

export default function SignInForm() {
  const{darkMode,toggleDarkMode}=useTheme()
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");
  const router = useRouter();
  const{user}=useAppSelector(state=> state.auth)
const dispatch = useAppDispatch();
console.log(user);

  const onSubmit = async (data: any) => {
    try {
      const res =await dispatch(login(data));
      console.log(res);
      
      // setMessage(res.data.message);
      // localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/dashboard"); // redirect on success
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <form
    onSubmit={handleSubmit(onSubmit)}
    className="max-w-md mx-auto p-6 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl space-y-5 border border-gray-200 dark:border-gray-700"
  >
    <h2 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white">🔐 Sign In</h2>
  
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
        {...register("password", { required: "Password is required" })}
        placeholder="Password"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      {/* {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>} */}
    </div>
  
    <button
      type="submit"
      className="w-full py-2 font-semibold rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition duration-200 shadow-md hover:shadow-lg"
    >
      Sign In
    </button>
  
    {message && <p className="text-sm text-center mt-3 text-gray-600 dark:text-gray-300">{message}</p>}
  </form>
  
  );
}
