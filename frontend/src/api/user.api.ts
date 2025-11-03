// api endpoint to GET /api/auth/me and POST /api/auth/logout
import { api } from "./http/axios";
import type { User } from "../types/user";
import { ME_URL } from "../lib/config";
import { LOGOUT_URL } from "../lib/config";

export async function getUserCredentials(): Promise<User | null> {
    const path = ME_URL;
    const response = await api.get<User | null>(path);
    return response.data;
}

    export async function postLogoutUser(): Promise<void> {
        const path = LOGOUT_URL;
    await api.post<void>(path);
}