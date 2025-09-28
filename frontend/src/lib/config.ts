export const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost:7124";

export const GOOGLE_LOGIN_URL = `${API_URL}/auth/google`;
export const LOGOUT_URL = `${API_URL}/auth/logout`;
export const ME_URL = `${API_URL}/auth/me`;
