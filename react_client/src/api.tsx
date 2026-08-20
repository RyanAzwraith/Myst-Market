import { config, logger } from "@/core";
import { ServerException, AppException } from "@/core/errors";
import { useAuthState } from '@/features/user/authState';

type RequestOptions = RequestInit & {
    responseType?: "json" | "blob"
}

const createRequestConfig = (
    options: RequestInit,
    accessToken?: string | null
): RequestInit => {
    const headers = new Headers(options.headers)

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json")
    }
    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`)
    }

    return {
        ...options,
        credentials: "include",
        headers,
    }
};

async function refreshToken(): Promise<string | null> {
    const res = await fetch(`${config.VITE_SERVER_URL}/refresh`, {             
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
    options: RequestOptions = {},
    token?: string | null
): Promise<T> {
	const { responseType = "json", ...fetchOptions } = options;

	logger.info(`req: ${endpoint} - ${JSON.stringify(options)}`);

    const response = await fetch(
        `${config.VITE_SERVER_URL}${endpoint}`,
        createRequestConfig(fetchOptions, token)
    );

    const data = response.ok && responseType === "blob"
        ? await response.blob()
        : await response.json().catch(() => ({}));
    if (!response.ok) {
		logger.warn(`${response.status} - ${data?.message}`)
        throw new ServerException({
            message: data?.message,
            statusCode: response.status,
            details: data?.details,
        });
    }
    return data;
}

async function authRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const accessToken = useAuthState.getState().accessToken
    try{
        return await request(endpoint, options, accessToken)
    } catch (error) {
        if (error instanceof ServerException && error.statusCode === 451){
            const newToken = await refreshToken();
            if (newToken) {
                return await request(endpoint, options, newToken)
            }
        }
        throw error;
    }
}
    
async function actionRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const setPasswordToken =new URLSearchParams(window.location.search).get("token");
    if (!setPasswordToken) 
        throw new AppException({message:"Missing action token"});
    return await request(endpoint, options, setPasswordToken)
}


const getHealth = async (): Promise<string> => request("/health");

export type { RequestOptions }
export { refreshToken, request, getHealth, authRequest, actionRequest}