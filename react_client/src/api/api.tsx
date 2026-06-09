import type { User } from "@/models/user";
import { config } from "../core/config"

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${config.VITE_SERVER_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
            errorData?.detail || `API error: ${response.status}`
        );
    }

    return response.json();
}

/**
 * Types for your API responses
 */
export interface HealthResponse {
    message: string;
}

/**
 * API functions
 */
export const api = {
    getHealth: () => request<HealthResponse>("/"),
    getUser: (email: string, password: string) => request<User>("/user", {
        method: "GET",
        body: JSON.stringify({ email, password }),
    }),
};