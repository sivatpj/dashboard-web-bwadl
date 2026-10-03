import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ISupplier, QueryOptions } from "@/api/types";

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
	suppliers: Array<
		ISupplier & {
			pendingDeliveryCount: number;
			totalFinanced: number;
			totalDelays: number;
		}
	>;
}

export function useFetchSuppliers(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "suppliers", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/suppliers`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
