import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

type Params = {
	salesOrderId: number;
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

export function useBulkSalesPayment(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collections", "sales-order-bulk-payment", params.salesOrderId];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(
			`/backoffice/collections/sales-order/${params.salesOrderId}/bulk-payment`,
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
