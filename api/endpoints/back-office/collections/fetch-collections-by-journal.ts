import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ICollection, QueryOptions } from "@/api/types";

interface FetchCollectionsByJournalResponse {
	timestamp: number;
	success: boolean;
	collections: ICollection[];
	totalCount: number;
}

interface FetchCollectionsByJournalParams {
	page?: number;
	limit?: number;
}

export function useFetchCollectionsByJournal(
	journalId: number | undefined,
	params?: FetchCollectionsByJournalParams,
	options?: QueryOptions<FetchCollectionsByJournalResponse>,
) {
	const client = useAxios();
	const queryKey = ["back-office", "collections", "collectionsbyjournal", journalId, params?.page, params?.limit];

	const queryFn = async () => {
		const { data: response } = await client.get<FetchCollectionsByJournalResponse>(
			`/backoffice/collections/collectionsbyjournal`,
			{ params: { journalId, ...params } },
		);
		return response;
	};

	return useQuery({
		enabled: !!journalId,
		queryFn,
		queryKey,
		...options,
	});
}
