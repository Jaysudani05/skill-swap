import axios from "axios";

// Decide API base URL from env, with localhost as dev fallback only
const getBaseURL = () => {
  // 1) Prefer explicit API base URL (must end with /api for Express routes)
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    return url.endsWith("/api") ? url : `${url}/api`;
  }

  // 2) Fallback to legacy VITE_BACKEND_URL if present
  if (import.meta.env.VITE_BACKEND_URL) {
    // Ensure it ends with /api for consistency
    if (import.meta.env.VITE_BACKEND_URL.endsWith("/api")) {
      return import.meta.env.VITE_BACKEND_URL;
    }
    return `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;
  }

  // 3) Local dev default
  return "http://localhost:3000/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Send Bearer token from localStorage so auth works cross-origin (cookie may not be sent)
API.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" && window.localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;