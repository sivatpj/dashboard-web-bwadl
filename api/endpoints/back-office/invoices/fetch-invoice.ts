import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import {
	IBuyer,
	ICollection,
	ICollector,
	IFinancierOffer,
	IFinancierSupplierContract,
	IInsurer,
	IInvoice,
	ISupplier,
	QueryOptions,
} from "@/api/types";
import { IQueryId } from "@/api/types/query-id";

interface Params {
	id: IQueryId;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	invoice: IInvoice & {
		reference?: string;
		buyer: IBuyer;
		supplier: ISupplier;
		collections: ICollection[];
		insurer: IInsurer;
		collector: ICollector;
		financierOffer: IFinancierOffer;
		financierSupplierContract: IFinancierSupplierContract;
	};
}

export function useFetchInvoice(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "invoices", params.id];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/invoices/${params.id}`);
		const invoiceAmount = response.invoice.deliveryAmount || response.invoice.invoiceAmount || (response.invoice as any).amount || 0;

		return {
			...response,
			invoice: {
				...response.invoice,
				invoiceAmount,
				invoiceReference: response.invoice.invoiceReference || (response.invoice as any).reference || "",
				reference: (response.invoice as any).reference || response.invoice.invoiceReference || "",
				status: response.invoice.status,
			},
		};
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
