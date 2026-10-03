import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IPaymentTransaction, QueryOptions } from "@/api/types";

interface FetchPaymentTransactionsListParams {
	buyerId?: number;
	salesOrderId?: number;
	invoiceId?: number;
	batchId?: string;
	q?: string;
	page?: number;
	limit?: number;
}

interface FetchPaymentTransactionsListResponse {
	timestamp: number;
	success: boolean;
	paymentTransactions: IPaymentTransaction[];
	totalCount?: number;
	totalJournals?: number;
	totalPaid?: number;
}

export function useFetchPaymentTransactionsList(
	params: FetchPaymentTransactionsListParams,
	options?: QueryOptions<FetchPaymentTransactionsListResponse>,
) {
	const client = useAxios();
	const queryKey = ["back-office", "collections", "payment-transactions-list", params];

	const queryFn = async () => {
		const { data: response } = await client.get<FetchPaymentTransactionsListResponse>(
			`/backoffice/collections/payment-transactions`,
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
