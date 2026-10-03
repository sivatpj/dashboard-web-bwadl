import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface IgnoredOrdersUploadBody {
	file: File;
}

interface IgnoredOrdersUploadResponse {
	timestamp: number;
	success: boolean;
	message: string;
	rows_parsed: number;
	rows_inserted: number;
	rows_skipped_invalid: number;
	rows_skipped_duplicate: number;
}

export function useIgnoredOrdersUpload(
	options?: MutationOptions<IgnoredOrdersUploadResponse, IgnoredOrdersUploadBody>,
) {
	const client = useAxios();
	const mutationKey = ["back-office", "collection-advice", "ignored-orders-upload"];

	const mutationFn = async (body: IgnoredOrdersUploadBody) => {
		const formData = new FormData();
		formData.append("file", body.file);

		const { data: response } = await client.post<IgnoredOrdersUploadResponse>(
			`/collection-advice/ignored-orders-upload`,
			formData,
			{ headers: { "Content-Type": "multipart/form-data" } },
		);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
