// TODO auth token, logging, error handling
import { api } from "./axios";

api.interceptors.request.use((config) => {
  console.log("📤 Outgoing request:", config.method?.toUpperCase(), config.url);
  // test header
  config.headers["X-Debug"] = "hello-interceptor";
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log("✅ Response OK:", res.status, res.config.url);
    return res;
  },
  (err) => {
    console.warn("❌ Response error:", err.message);
    return Promise.reject(err);
  }
);
