import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBank, QueryOptions } from "@/api/types";
import { IQueryId } from "@/api/types/query-id";

interface Params {
	id: IQueryId;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	bank: IBank;
}

export function useFetchBank(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "banks", params.id];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/banks/${params.id}`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
