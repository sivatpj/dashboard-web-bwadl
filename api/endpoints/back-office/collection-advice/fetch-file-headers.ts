import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IFileHeader, QueryOptions } from "@/api/types";

interface Params {
	page?: number;
	limit?: number;
	batch_id?: string;
}

interface FetchFileHeadersResponse {
	timestamp: number;
	success: boolean;
	headers: IFileHeader[];
	totalCount: number;
}

export function useFetchFileHeaders(params?: Params, options?: QueryOptions<FetchFileHeadersResponse>) {
	const client = useAxios();
	const queryKey = ["back-office", "collection-advice", "file-headers", params];

	const queryFn = async () => {
		const { data: response } = await client.get<FetchFileHeadersResponse>(`/collection-advice/file-headers`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
