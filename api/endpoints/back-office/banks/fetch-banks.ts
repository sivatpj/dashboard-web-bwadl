import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBank, IFinancier, QueryOptions } from "@/api/types";

interface Params {
	page?: number;
	limit?: number;
	q?: string;
	from?: string;
	to?: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	banks: Array<
		IBank & {
			financier: IFinancier;
		}
	>;
}

export function useFetchBanks(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "banks", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/banks`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
