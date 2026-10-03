import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyerFinancierLimit, QueryOptions } from "@/api/types";

type Params = {
	id: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	financierLimits: IBuyerFinancierLimit[];
}

export function useFetchBuyerFinancierLimits(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "buyers", String(params.id), "financier-limits"];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/buyers/${params.id}/financier-limits`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
