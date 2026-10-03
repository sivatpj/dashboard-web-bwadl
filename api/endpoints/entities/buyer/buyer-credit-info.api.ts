import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, QueryOptions } from "@/api/types";

interface BuyerCreditInfoParams {
	crNumber: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	results: {
		buyer: IBuyer;
	};
}

export function useBuyerCreditInfo(
	params: BuyerCreditInfoParams = {
		// TEMPORARY
		crNumber: "7123456781",
	},
	options?: QueryOptions<Response>,
) {
	const client = useAxios();
	const queryKey = ["buyer", "credit-info"];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/participant/buyer-creditinfo"];`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
