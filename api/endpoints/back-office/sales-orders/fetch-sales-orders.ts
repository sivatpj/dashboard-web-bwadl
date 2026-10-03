import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, ICollector, IFinancierOffer, IInsurer, ISalesOrder, ISupplier, QueryOptions } from "@/api/types";

interface Params {
	page?: number;
	limit?: number;
	q?: string;
	buyerId?: number;
	collectorId?: number;
	supplierId?: number;
	financierId?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	deliveryStatus?: "cancelled" | "not-delivered" | "over-delivered" | "delivered" | "partially-delivered";
}

interface RawResponse {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	salesOrders: Array<{
		salesOrder: ISalesOrder;
		buyer?: IBuyer;
		collector?: ICollector;
		insurer?: IInsurer;
		financierOffer?: IFinancierOffer;
		supplier?: ISupplier;
		invoicesCount?: number;
		calcDeliveryAmount?: number;
		calcOutstanding?: number;
		calcPaidAmount?: number;
		calcOverdue?: number;
		deliveryStatus?: "cancelled" | "not-delivered" | "over-delivered" | "delivered" | "partially-delivered";
	}>;
	filters?: {
		collectors: Array<{ id: number; name: string | null }>;
		suppliers: Array<{ id: number; name: string | null }>;
		financiers: Array<{ id: number; name: string | null }>;
	};
}

type FlatSalesOrder = ISalesOrder & {
	buyer?: IBuyer;
	collector?: ICollector;
	insurer?: IInsurer;
	offer?: IFinancierOffer;
	supplier?: ISupplier;
	calcDeliveryAmount?: number;
	calcOutstanding?: number;
	calcPaidAmount?: number;
	calcOverdue?: number;
	invoicesCount?: number;
	deliveryStatus?: "cancelled" | "not-delivered" | "over-delivered" | "delivered" | "partially-delivered";
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	salesOrders: FlatSalesOrder[];
	filters?: {
		collectors: Array<{ id: number; name: string | null }>;
		suppliers: Array<{ id: number; name: string | null }>;
		financiers: Array<{ id: number; name: string | null }>;
	};
}

export function useFetchSalesOrders(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "sales-orders", params];

	const queryFn = async () => {
		const { data: response } = await client.get<RawResponse>(`/backoffice/sales-orders`, { params });

		return {
			...response,
			salesOrders: response.salesOrders.map(item => ({
				...item.salesOrder,
				buyer: item.buyer,
				calcDeliveryAmount: item.calcDeliveryAmount ?? (item.salesOrder as any).calcDeliveryAmount,
				calcOutstanding: item.calcOutstanding ?? (item.salesOrder as any).calcOutstanding,
				calcPaidAmount: item.calcPaidAmount ?? (item.salesOrder as any).calcPaidAmount,
				calcOverdue: item.calcOverdue ?? (item.salesOrder as any).calcOverdue,
				collector: item.collector,
				deliveryStatus: item.deliveryStatus ?? (item.salesOrder as any).deliveryStatus,
				insurer: item.insurer,
				invoicesCount: item.invoicesCount ?? (item.salesOrder as { invoicesCount?: number }).invoicesCount ?? 0,
				offer: item.financierOffer,
				supplier: item.supplier,
			})),
		};
	};

	return useQuery({
		placeholderData: keepPreviousData,
		queryFn,
		queryKey,
		...options,
	});
}
