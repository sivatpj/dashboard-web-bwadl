import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IFileData, MutationOptions } from "@/api/types";

interface FetchFileDataBody {
	batch_id: string;
	process_status?: string;
	order_reference?: string;
	page?: number;
	limit?: number;
}

interface FetchFileDataResponse {
	timestamp: number;
	success: boolean;
	data: IFileData[];
	totalCount: number;
}

export function useFetchFileData(options?: MutationOptions<FetchFileDataResponse, FetchFileDataBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collection-advice", "file-data"];

	const mutationFn = async (body: FetchFileDataBody) => {
		const { data: response } = await client.post<FetchFileDataResponse>(`/collection-advice/file-data`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
