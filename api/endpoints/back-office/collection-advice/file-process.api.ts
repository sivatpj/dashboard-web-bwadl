import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface FileProcessBody {
	batch_id: string;
	reprocess: boolean;
}

interface FileProcessResponse {
	timestamp: number;
	success: boolean;
	message: string;
}

export function useFileProcess(options?: MutationOptions<FileProcessResponse, FileProcessBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collection-advice", "file-process"];

	const mutationFn = async (body: FileProcessBody) => {
		const { data: response } = await client.post<FileProcessResponse>(`/collection-advice/file-process`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
