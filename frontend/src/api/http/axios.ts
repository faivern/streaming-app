import axios from "axios";

const timeout = 10000;
// In Docker: env var is empty, use relative URL (nginx proxies /api to backend)
// In local dev: use VITE_BACKEND_API_URL from .env
const baseURL =
  import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL,
  timeout,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
