import type { User } from "@/models/user";
import { config, logger } from "../core"
import { ServerError } from "../core/errors"


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
        throw new ServerError({
            responseStatus: response.status,
            details : errorData
        });
    }
    const json = response.json()
    logger.info(`req: ${endpoint} - ${JSON.stringify(options)}`)
    logger.info(JSON.stringify(json))
    return json;
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

    getHealth: () => request<HealthResponse>("/health"),

    login: (email: string, password: string) => request<User>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }),
};