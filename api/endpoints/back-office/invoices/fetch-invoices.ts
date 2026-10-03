import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, ICollection, IInvoice, IQueryId, ISupplier, QueryOptions } from "@/api/types";

interface Params {
	page?: number;
	limit?: number;
	q?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	buyerId?: IQueryId;
	collectorId?: IQueryId;
	financierId?: IQueryId;
	supplierId?: IQueryId;
	statuses?: IInvoice["status"][];
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	invoices: Array<
		IInvoice & {
			collections: ICollection[];
			buyer: IBuyer;
			supplier: ISupplier;
			financierName: string | null;
			financierFacilityName: string | null;
		}
	>;
	collectorSummary?: {
		totalBuyersUnderCollector: number;
		totalPaidAmount: number;
		totalOutstandingAmount: number;
		totalOverdueAmount: number;
	};
	filters?: {
		suppliers: Array<{ id: number; name: string | null }>;
		financiers: Array<{ id: number; name: string | null }>;
		collectors: Array<{ id: number; name: string | null }>;
	};
}

function getEffectiveInvoiceAmount(invoice: IInvoice & { amount?: number }) {
	return invoice.deliveryAmount || invoice.invoiceAmount || invoice.amount || 0;
}

export function useFetchInvoices(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "invoices", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/invoices`, { params });

		return {
			...response,
			invoices: (response.invoices || []).map(invoice => ({
				...invoice,
				invoiceAmount: getEffectiveInvoiceAmount(invoice),
				invoiceReference: invoice.invoiceReference || (invoice as any).reference || "",
				outstandingAmount: (invoice as any).calcOutstanding,
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
