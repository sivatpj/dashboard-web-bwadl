import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ICollection, QueryOptions } from "@/api/types";

interface FetchCollectionsByBatchResponse {
	timestamp: number;
	success: boolean;
	collections: ICollection[];
}

export function useFetchCollectionsByBatch(
	batchId: string | undefined,
	options?: QueryOptions<FetchCollectionsByBatchResponse>,
) {
	const client = useAxios();
	const queryKey = ["back-office", "collections", "collectionsbybatch", batchId];

	const queryFn = async () => {
		const { data: response } = await client.get<FetchCollectionsByBatchResponse>(
			`/backoffice/collections/collectionsbybatch`,
			{ params: { batchId } },
		);
		return response;
	};

	return useQuery({
		enabled: !!batchId,
		queryFn,
		queryKey,
		...options,
	});
}
