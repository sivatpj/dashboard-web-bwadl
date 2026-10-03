import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IJournalEntry, QueryOptions } from "@/api/types";

export interface IInvoiceAction {
	actionId: number;
	type: string;
	id: number;
	salesOrderId: number;
	reference: string;
	v: number;
	deliveryAmount: number | null;
	deliveryDate: string | null;
	financingAmount: number | null;
	isCancelled: boolean | null;
	isFinal: boolean | null;
	journalEntryId: number | null;
	actionBy: any;
	actionDate: string;
	journalEntries: IJournalEntry[];
}

interface FetchInvoiceActionsResponse {
	actions: IInvoiceAction[];
}

export function useFetchInvoiceActions(
	invoiceId: number | string | undefined,
	options?: QueryOptions<FetchInvoiceActionsResponse>,
	type?: string,
) {
	const client = useAxios();
	const queryKey = ["back-office", "invoices", invoiceId, "actions", type ?? "all"];

	const queryFn = async () => {
		if (!invoiceId) throw new Error("Invoice ID is required");
		const params = type && type !== "all" ? { type } : {};
		const { data } = await client.get<FetchInvoiceActionsResponse>(`/backoffice/invoices/${invoiceId}/actions`, { params });
		return data;
	};

	return useQuery({ enabled: Boolean(invoiceId), queryFn, queryKey, ...options });
}
