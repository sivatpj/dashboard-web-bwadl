import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IJournalEntry, IJournalEntryLine, QueryOptions } from "@/api/types";

interface FetchJournalEntriesParams {
	batchId: string;
}

interface FetchJournalEntriesResponse {
	timestamp: number;
	success: boolean;
	journalEntries: IJournalEntry[];
}

export function useFetchJournalEntriesByBatch(
	params: FetchJournalEntriesParams,
	options?: QueryOptions<FetchJournalEntriesResponse>,
) {
	const client = useAxios();
	const queryKey = ["back-office", "collection-advice", "journal-entries", params.batchId];

	const queryFn = async () => {
		const { data: response } = await client.get<FetchJournalEntriesResponse>(`/backoffice/transactions`, {
			params: { q: params.batchId },
		});

		return response;
	};

	return useQuery({
		enabled: Boolean(params.batchId),
		queryFn,
		queryKey,
		...options,
	});
}

interface FetchJournalEntryLinesResponse {
	timestamp: number;
	success: boolean;
	lines: IJournalEntryLine[];
}

export function useFetchJournalEntryLines(id?: number, options?: QueryOptions<FetchJournalEntryLinesResponse>) {
	const client = useAxios();
	const queryKey = ["back-office", "collection-advice", "journal-entry-lines", id];

	const queryFn = async () => {
		if (!id) throw new Error("Journal entry ID is required");

		const { data: response } = await client.get<FetchJournalEntryLinesResponse>(`/backoffice/transactions/${id}/lines`);

		return response;
	};

	return useQuery({
		enabled: Boolean(id),
		queryFn,
		queryKey,
		...options,
	});
}
