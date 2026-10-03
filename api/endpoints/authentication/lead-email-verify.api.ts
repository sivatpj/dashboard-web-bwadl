import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";

interface LeadEmailVerifyParams {
	token: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
}

export function useLeadEmailVerify(params: LeadEmailVerifyParams, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["authentication", "lead-email-verify"];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/user/lead-email-verify/${params.token}`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
