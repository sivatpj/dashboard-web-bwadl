import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ISalesOrder, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

type Body = {
	reference?: string;
	amount?: number;
	orderDate?: string;
	settlementDate?: string;
	orderType?: string;
	isCancelled?: boolean;
	isClosed?: boolean;
	isManuallyVerified?: boolean;
	additionalInfo?: any;
	buyerId?: number;
	bwadlId?: number;
	collectorId?: number;
	insurerId?: number;
	offerId?: number;
	supplierId?: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	salesOrder: ISalesOrder;
}

export function useUpdateSalesOrder(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "sales-orders", "update"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.put<Response>(`/backoffice/sales-orders/${params.id}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
