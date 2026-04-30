import axios from "axios";
import { getSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/api-base";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined" && config.headers) {
      const session = await getSession();
      const token = session?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
