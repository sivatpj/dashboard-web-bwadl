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

export function useDeleteSalesOrder(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "sales-orders", "delete", params.id];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.delete<Response>(`/backoffice/sales-orders/${params.id}`, { data: body });

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
