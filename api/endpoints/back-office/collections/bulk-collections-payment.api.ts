import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

type Params = {
	invoiceId: number;
};

type Body = {
	amount: number;
	appliedAt?: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
}

export function useBulkCollectionsPayment(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collections", "bulk-payment"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(
			`/backoffice/collections/${params.invoiceId}/bulk-payment`,
			body,
		);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
