import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IIgnoredOrder, QueryOptions } from "@/api/types";

interface Params {
	page?: number;
	limit?: number;
}

interface FetchIgnoredListResponse {
	timestamp: number;
	success: boolean;
	ignoredOrders: IIgnoredOrder[];
	totalCount: number;
}

export function useFetchIgnoredList(params?: Params, options?: QueryOptions<FetchIgnoredListResponse>) {
	const client = useAxios();
	const queryKey = ["back-office", "collection-advice", "ignored-list", params];

	const queryFn = async () => {
		const { data: response } = await client.get<FetchIgnoredListResponse>(`/collection-advice/ignored-list`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
