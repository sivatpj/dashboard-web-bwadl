import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, ICollection, ICollector, IInvoice, QueryOptions } from "@/api/types";
import { IQueryId } from "@/api/types/query-id";

interface Params {
	id: IQueryId;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	collector: ICollector & {
		invoicesAmount: number;
		collectedAmount: number;
		remainingAmount: number;
	};
}

export function useFetchCollector(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "collectors", params.id];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/collectors/${params.id}`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
