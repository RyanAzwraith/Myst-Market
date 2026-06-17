import { config, logger } from "@/core";
import { ServerException, AppException } from "@/core/errors";
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
    options: RequestInit = {},
    token?: string | null
): Promise<T> {
	
	logger.info(`req: ${endpoint} - ${JSON.stringify(options)}`);

    const response = await fetch(
        `${config.VITE_SERVER_URL}${endpoint}`,
        createRequestConfig(options, token)
    );

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

async function authRequest<T>(
    endpoint: string,
    options: RequestInit = {}
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
    options: RequestInit = {}
): Promise<T> {
    const setPasswordToken =new URLSearchParams(window.location.search).get("token");
    if (!setPasswordToken) 
        throw new AppException({message:"Missing action token"});
    return await request(endpoint, options, setPasswordToken)
}


const getHealth = async (): Promise<string> => request("/health");

export { refreshToken, request, getHealth, authRequest, actionRequest}