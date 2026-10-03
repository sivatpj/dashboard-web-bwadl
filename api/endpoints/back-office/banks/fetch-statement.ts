import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IStatementLine, QueryOptions } from "@/api/types";

interface Params {
	page?: number;
	limit?: number;
	q?: string;
	accountId: number;
	from: string;
	to: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

interface Response {
	timestamp: number;
	success: boolean;
	statement: IStatementLine;
}

export function useFetchStatement(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "banks", "statement", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/banks/account-statement`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
