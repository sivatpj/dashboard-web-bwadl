import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";

export interface ISalesOrderAction {
	actionId: number;
	type: string;
	id: number;
	supplierId: number;
	reference: string;
	v: number;
	isCurrent: boolean;
	amount: number;
	orderType: string | null;
	orderDate: string | null;
	isCancelled: boolean | null;
	isClosed: boolean | null;
	journalEntryId: number | null;
	actionBy: any;
	actionDate: string;
}

interface FetchSalesOrderActionsResponse {
	actions: ISalesOrderAction[];
}

export function useFetchSalesOrderActions(
	salesOrderId: number | string | undefined,
	options?: QueryOptions<FetchSalesOrderActionsResponse>,
	type?: string,
) {
	const client = useAxios();
	const queryKey = ["back-office", "sales-orders", salesOrderId, "actions", type ?? "all"];

	const queryFn = async () => {
		if (!salesOrderId) throw new Error("Sales order ID is required");
		const params = type && type !== "all" ? { type } : {};
		const { data } = await client.get<FetchSalesOrderActionsResponse>(
			`/backoffice/sales-orders/${salesOrderId}/actions`,
			{ params },
		);
		return data;
	};

	return useQuery({ enabled: Boolean(salesOrderId), queryFn, queryKey, ...options });
}
