import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ISalesOrder, MutationOptions } from "@/api/types";

type Body = {
	amount: number;
	reference?: string;
	orderDate?: string;
	settlementDate?: string | null;
	orderType?: "order" | "contract";
	additionalInfo?: any;
	batchId?: string | null;
	isCancelled?: boolean;
	isClosed?: boolean;
	isManuallyVerified?: boolean;
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

export function useCreateSalesOrder(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "sales-orders", "create"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/sales-orders`, body);
		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
