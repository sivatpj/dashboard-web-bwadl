import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, QueryOptions } from "@/api/types";

interface BuyerDashboardParams {
	crNumber: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	results: {
		buyer: IBuyer;
		installments: any[];
		orders: any;
	};
}

export function useBuyerDashboard(
	params: BuyerDashboardParams = {
		// TEMPORARY
		crNumber: "7123456781",
	},
	options?: QueryOptions<Response>,
) {
	const client = useAxios();
	const queryKey = ["buyer", "dashboard"];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/participant/buyer-dashboard`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
