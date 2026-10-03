import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, ICollection, IInvoice, ISupplier, QueryOptions } from "@/api/types";

interface Params {
	id: string;
	page?: number;
	limit?: number;
	q?: string;
	supplierId?: string;
	financierId?: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	buyers: Array<
		IBuyer & {
			invoicesCount: number;
			deliveryAmount: number;
			paidAmount: number;
			remainingAmount: number;
			overdueAmount: number;
		}
	>;
}

export function useFetchCollectorBuyers(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "collectors", params.id, "buyers", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/collectors/${params.id}/buyers`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
