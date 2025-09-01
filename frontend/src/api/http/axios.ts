// TODO axios instance with baseURL, timeout
import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_API_URL ?? "http://localhost:5000/api";

    if (!baseURL) {
        throw new Error("No base URL defined");
    }

export const api = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    }
});

export default api;