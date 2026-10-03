import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface FileUploadBody {
	file: File;
	collectorId: number;
	date?: string;
}

interface FileUploadResponse {
	timestamp: number;
	success: boolean;
	message: string;
	batch_id?: string;
	file_id?: number;
}

export function useFileUpload(options?: MutationOptions<FileUploadResponse, FileUploadBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collection-advice", "file-upload"];

	const mutationFn = async (body: FileUploadBody) => {
		const formData = new FormData();
		formData.append("file", body.file);
		formData.append("collector_id", String(body.collectorId));
		if (body.date) formData.append("date", body.date);

		const { data: response } = await client.post<FileUploadResponse>(`/collection-advice/file-upload`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
