import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ISalesOrder, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

type Body = {
	reason?: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	salesOrder: ISalesOrder;
}

export function useCancelSalesOrder(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "sales-orders", "cancel", params.id];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/sales-orders/cancel/${params.id}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
