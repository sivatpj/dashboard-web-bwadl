import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface Response {
	token: string;
	success: boolean;
	timestamp: number;
}

export function useRefreshToken(options?: MutationOptions<Response>) {
	const client = useAxios();
	const mutationKey = ["authentication", "refresh-token"];

	const mutationFn = async () => {
		const { data: response } = await client.post<Response>(`/user/token-refresh`);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
