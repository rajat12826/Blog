"use client";
import axios from "axios";

export const signup = async (data: { email: string; password: string }) => {
  return axios.post("/api/auth/signup", data);
};

export const login = async (data: { email: string; password: string }) => {
  return axios.post("/api/auth/signin", data);
};

export const axiosServices = axios.create({ baseURL: "https://rajat-blogs-three.vercel.app/api", withCredentials:true });