import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	batch_id: string;
	payment_transaction_ids: number[];
}

export function useReverseFileUploadPayment(options?: MutationOptions<Response, string>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collection-advice", "reverse-payment"];

	const mutationFn = async (batchId: string) => {
		const { data: response } = await client.post<Response>(`/collection-advice/reverse-payment`, { batch_id: batchId });

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
