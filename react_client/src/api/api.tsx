const API_BASE_URL = import.meta.env.VITE_SERVER_URL as string;

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
};