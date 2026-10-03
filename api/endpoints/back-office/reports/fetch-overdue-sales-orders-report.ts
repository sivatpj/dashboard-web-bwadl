import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";

interface Params {
	fromDate?: string;
	toDate?: string;
	overdueAsOfDate?: string;
	collectorId?: number;
	supplierId?: number;
	buyerId?: number;
	financierId?: number;
	minDelayedDays?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	page?: number;
	pageSize?: number;
}

export interface IOverdueSalesOrderRow {
	orderDate: string;
	reference: string;
	orderAmount: number;
	deliveryReference: string | null;
	deliveryDate: string | null;
	deliveryAmount: number;
	overdueAmount: number;
	delayedDays: number;
	buyerFacilityName: string | null;
	supplierFacilityName: string | null;
	collectorFacilityName: string | null;
	financierFacilityName: string | null;
}

export interface IOverdueReportFilterOption {
	id: number;
	name: string | null;
}

interface Response {
	rows: IOverdueSalesOrderRow[];
	totalCount: number;
	filters: {
		collectors: IOverdueReportFilterOption[];
		suppliers: IOverdueReportFilterOption[];
		buyers: IOverdueReportFilterOption[];
		financiers: IOverdueReportFilterOption[];
	};
}

export function useFetchOverdueSalesOrdersReport(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "sales-orders", "reports", "overdue", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/sales-orders/reports/overdue`, { params });

		return response;
	};

	return useQuery({
		placeholderData: keepPreviousData,
		queryFn,
		queryKey,
		...options,
	});
}