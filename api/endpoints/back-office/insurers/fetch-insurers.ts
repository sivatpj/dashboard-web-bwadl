import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IInsurer, QueryOptions } from "@/api/types";

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
	insurers: IInsurer[];
}

export function useFetchInsurers(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "insurers", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/insurers`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
