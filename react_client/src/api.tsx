import { config, logger } from "@/core";
import { ServerException } from "@/core/errors";
import { useAuthState } from '@/features/user/authState';

const createRequestConfig = (
    options: RequestInit,
    accessToken?: string | null
): RequestInit => ({
    ...options,
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
    },
});

async function refreshToken(): Promise<string | null> {
    const res = await fetch(`${config.VITE_SERVER_URL}/auth/refresh`, {
        method: "GET",
        credentials: "include",
    });

    if (!res.ok) return null;
    const data = await res.json();
    useAuthState.setState({accessToken: data.accessToken,});
    return data.accessToken;
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    const accessToken = useAuthState.getState().accessToken;
	
	logger.info(`req: ${endpoint} - ${JSON.stringify(options)}`);

    let response = await fetch(
        `${config.VITE_SERVER_URL}${endpoint}`,
        createRequestConfig(options, accessToken)
    );

    if (response.status === 451 ) {
        const newToken = await refreshToken();
        if (newToken) 
            response = await fetch(
                `${config.VITE_SERVER_URL}${endpoint}`,
                createRequestConfig(options, newToken)
			)
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
		logger.info("- status not ok");
        throw new ServerException({
            message: data?.message,
            statusCode: response.status,
            details: data?.details,
        });
    }
	logger.info("- status OK");
    return data;
}


const getHealth = async (): Promise<string> => request("/health");

export { refreshToken, request, getHealth}