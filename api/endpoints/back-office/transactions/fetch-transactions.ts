import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IJournalEntry, IJournalEntryLine, QueryOptions } from "@/api/types";

interface FetchTransactionsParams {
	page?: number;
	limit?: number;
	q?: string;
	exactRef?: string;
	from?: string;
	to?: string;
	referenceNumber?: string;
	status?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

interface FetchTransactionsResponse {
	timestamp: number;
	success: boolean;
	journalEntries: IJournalEntry[];
	totalCount: number;
}

export function useFetchTransactions(
	params?: FetchTransactionsParams,
	options?: QueryOptions<FetchTransactionsResponse>,
) {
	const client = useAxios();
	const queryKey = ["back-office", "accounting", "transactions", params];

	const queryFn = async () => {
		const { data: response } = await client.get<FetchTransactionsResponse>(`/backoffice/transactions`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}

interface FetchTransactionByIdResponse {
	timestamp: number;
	success: boolean;
	journalEntry: IJournalEntry;
	invoiceAmount?: number;
	deliveryAmount?: number;
}

export function useFetchTransactionById(id?: number, actionDate?: string, options?: QueryOptions<FetchTransactionByIdResponse>) {
	const client = useAxios();
	const queryKey = ["back-office", "accounting", "transactions", id, actionDate];

	const queryFn = async () => {
		if (!id) {
			throw new Error("Transaction ID is required");
		}

		const params = actionDate ? { actionDate } : {};
		const { data: response } = await client.get<FetchTransactionByIdResponse>(`/backoffice/transactions/${id}`, { params });

		return response;
	};

	return useQuery({
		enabled: Boolean(id),
		queryFn,
		queryKey,
		...options,
	});
}

interface FetchTransactionLinesResponse {
	timestamp: number;
	success: boolean;
	lines: IJournalEntryLine[];
}

export function useFetchTransactionLines(id?: number, options?: QueryOptions<FetchTransactionLinesResponse>) {
	const client = useAxios();
	const queryKey = ["back-office", "accounting", "transactions", id, "lines"];

	const queryFn = async () => {
		if (!id) {
			throw new Error("Transaction ID is required");
		}

		const { data: response } = await client.get<FetchTransactionLinesResponse>(`/backoffice/transactions/${id}/lines`);

		return response;
	};

	return useQuery({
		enabled: Boolean(id),
		queryFn,
		queryKey,
		...options,
	});
}
