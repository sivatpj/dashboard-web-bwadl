import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, ICollection, IInvoice, ISupplier, QueryOptions } from "@/api/types";

interface Params {
	salesOrderId: string | number;
}

type InvoiceWithRelations = IInvoice & {
	collections: ICollection[];
	buyer: IBuyer;
	supplier: ISupplier;
	salesOrderId?: number | string;
	salesOrder?: {
		id?: number | string;
	};
};

interface RawResponse {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	invoices: Array<
		IInvoice & {
			collections: ICollection[];
			buyer: IBuyer;
			supplier: ISupplier;
			salesOrderId?: number | string;
			salesOrder?: {
				id?: number | string;
			};
		}
	>;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	invoices: InvoiceWithRelations[];
}

function getEffectiveInvoiceAmount(invoice: IInvoice & { amount?: number }) {
	return invoice.deliveryAmount || invoice.invoiceAmount || invoice.amount || 0;
}

export function useFetchSalesOrderInvoices(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "sales-orders", params.salesOrderId, "invoices"];

	const queryFn = async () => {
		const { data: response } = await client.get<RawResponse>(`/backoffice/invoices`, {
			params: { salesOrderId: params.salesOrderId },
		});
		const requestedSalesOrderId = String(params.salesOrderId);
		const invoices = (response.invoices || [])
			.map(item => ({
				...item,
				calcOverdue: (item as any).calcOverdue ?? 0,
				calcPaidAmount: (item as any).calcPaidAmount ?? 0,
				calcFirstInstallmentDate: (item as any).calcFirstInstallmentDate ?? null,
				calcLastInstallmentDate: (item as any).calcLastInstallmentDate ?? null,
				calcInstallmentCount: (item as any).calcInstallmentCount ?? 0,
				collections: item.collections || [],
				invoiceAmount: getEffectiveInvoiceAmount(item),
				invoiceReference: item.invoiceReference || (item as any).reference || "",
				outstandingAmount: (item as any).calcOutstanding,
			}))
			.filter(item => {
				const itemSalesOrderId = item.salesOrderId ?? item.salesOrder?.id;

				return itemSalesOrderId === undefined || itemSalesOrderId === null
					? false
					: String(itemSalesOrderId) === requestedSalesOrderId;
			});

		return {
			...response,
			invoices,
			totalCount: invoices.length,
		};
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
