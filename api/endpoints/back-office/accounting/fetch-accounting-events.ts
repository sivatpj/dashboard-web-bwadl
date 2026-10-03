import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IAccountingEvent } from "@/api/types/accounting-event";
import { QueryOptions } from "@/api/types";

interface FetchAccountingEventsParams {
	page?: number;
	limit?: number;
	q?: string;
	from?: string;
	to?: string;
	eventType?: string;
	entityType?: string;
	status?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

interface FetchAccountingEventsResponse {
	timestamp: number;
	success: boolean;
	message: string;
	accountingEvents: IAccountingEvent[];
	totalCount: number;
}

export function useFetchAccountingEvents(
	params?: FetchAccountingEventsParams,
	options?: QueryOptions<FetchAccountingEventsResponse>,
) {
	const client = useAxios();
	const queryKey = ["back-office", "accounting", "events", params];

	const queryFn = async () => {
		const { data: response } = await client.get<FetchAccountingEventsResponse>(
			`/backoffice/accounting/accounting-events`,
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
