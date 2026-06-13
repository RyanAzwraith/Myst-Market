import { config, logger } from "@/core";
import { ServerException } from "@/core/errors";
import { useAuthState } from '@/features/user/userState';

export async function request<ResponseType>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ResponseType> {
	const accessToken = useAuthState.getState().accessToken

	const response = await fetch(
		`${config.VITE_SERVER_URL}${endpoint}`, 
			{
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
                ...(accessToken && {
                    Authorization: `Bearer ${accessToken}`,
                }),
				...options.headers,
			},
			...options,
		}
	);
	logger.info(`req: ${endpoint} - ${JSON.stringify(options)}`);

	if (!response.ok) {
		logger.info("- status not ok");

		const errorData = await response.json().catch(() => ({}));
		throw new ServerException({
			message: errorData?.message,
			statusCode: response.status,
			details: errorData?.details
		})
	}

	logger.info("- status OK");
	return await response.json();
}

type HealthResponse = {
	message: string;
}

export const getHealth = async (): Promise<HealthResponse> => request<HealthResponse>("/health");