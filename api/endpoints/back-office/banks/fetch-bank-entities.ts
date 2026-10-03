import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBankEntity, QueryOptions } from "@/api/types";

interface Params {
	page?: number;
	limit?: number;
	q?: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	banks: IBankEntity[];
}

export function useFetchBankEntities(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "bank-entities", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/banks/entities`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
