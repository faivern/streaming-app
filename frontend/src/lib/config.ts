// In production (Docker), use relative URL so nginx proxies to backend
// In development, use the env variable or fallback to localhost
export const API_URL = import.meta.env.VITE_API_URL ?? "";

export const GOOGLE_LOGIN_URL = `${API_URL}/api/auth/google`;
export const LOGOUT_URL = `${API_URL}/api/auth/logout`;
export const ME_URL = `${API_URL}/api/auth/me`;
