import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";

interface BuyerInstallmentsParams {
	crNumber: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	results: any;
}

export function useBuyerInstallments(
	params: BuyerInstallmentsParams = {
		// TEMPORARY
		crNumber: "7123456781",
	},
	options?: QueryOptions<Response>,
) {
	const client = useAxios();
	const queryKey = ["buyer", "installments"];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/participant/buyer-installments`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
