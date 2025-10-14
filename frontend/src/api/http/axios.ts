import axios from "axios";

const timeout = 10000;
const baseURL = import.meta.env.VITE_BACKEND_API_URL;

    if (!baseURL) {
        throw new Error("No base URL defined");
    }

export const api = axios.create({
    baseURL,
    timeout,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    withCredentials: true
});

export default api;