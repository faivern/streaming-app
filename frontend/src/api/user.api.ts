// api endpoint to GET /api/auth/me and POST /api/auth/logout
import { api } from "./http/axios";
import type { User } from "../types/user";
import { ME_URL, LOGOUT_URL } from "../lib/config";

export async function getUserCredentials(): Promise<User | null> {
    try {
        const response = await api.get<User>(ME_URL);
        return response.data;
    } catch {
        // Any error (401, network error, redirect) means not authenticated
        return null;
    }
}

    export async function postLogoutUser(): Promise<void> {
        const path = LOGOUT_URL;
    await api.post<void>(path);
}