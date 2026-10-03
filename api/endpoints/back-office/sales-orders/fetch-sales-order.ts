import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, ICollector, IFinancierOffer, IInsurer, ISalesOrder, ISupplier, QueryOptions } from "@/api/types";
import { IQueryId } from "@/api/types/query-id";

interface Params {
	id: IQueryId;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	salesOrder: ISalesOrder;
	buyer?: IBuyer;
	collector?: ICollector;
	insurer?: IInsurer;
	financier?: { facilityName?: string; financierName?: string };
	financierOffer?: IFinancierOffer;
	supplier?: ISupplier;
	deliveryStatus?: "cancelled" | "not-delivered" | "over-delivered" | "delivered" | "partially-delivered";
}

export function useFetchSalesOrder(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "sales-orders", params.id];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/sales-orders/${params.id}`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
