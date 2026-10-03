import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IJournalEntry, QueryOptions } from "@/api/types";

interface FetchPaymentTransactionsParams {
	buyerId?: number;
	salesOrderId?: number;
	invoiceId?: number;
	q?: string;
	page?: number;
	limit?: number;
}

interface FetchPaymentTransactionsResponse {
	timestamp: number;
	success: boolean;
	journalEntries: IJournalEntry[];
	totalCount?: number;
}

export function useFetchPaymentTransactions(
	params: FetchPaymentTransactionsParams,
	options?: QueryOptions<FetchPaymentTransactionsResponse>,
) {
	const client = useAxios();
	const queryKey = ["back-office", "collections", "payment-transaction", params];

	const queryFn = async () => {
		const { data: response } = await client.get<FetchPaymentTransactionsResponse>(
			`/backoffice/collections/payment-transaction`,
			{ params },
		);
		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
