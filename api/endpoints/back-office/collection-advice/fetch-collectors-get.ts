import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ICollectionAdviceCollector, QueryOptions } from "@/api/types";

interface Response {
	timestamp: number;
	success: boolean;
	collectors: ICollectionAdviceCollector[];
}

export function useFetchCollectorsGet(options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "collection-advice", "collectors-get"];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/collectors-get`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
