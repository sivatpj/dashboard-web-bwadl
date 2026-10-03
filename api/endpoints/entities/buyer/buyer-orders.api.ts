import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";

interface BuyerOrdersParams {
	crNumber: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	results: any;
}

export function useBuyerOrders(
	params: BuyerOrdersParams = {
		// TEMPORARY
		crNumber: "7123456781",
	},
	options?: QueryOptions<Response>,
) {
	const client = useAxios();
	const queryKey = ["buyer", "orders"];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/participant/buyer-orders`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
