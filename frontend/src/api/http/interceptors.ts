import { api } from "./axios";

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);
