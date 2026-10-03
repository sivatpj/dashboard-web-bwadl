import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, QueryOptions } from "@/api/types";

interface Params {
	page?: number;
	limit?: number;
	q?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	buyers: IBuyer[];
}

export function useFetchBuyers(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "buyers", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/buyers`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
