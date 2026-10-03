import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IInvoice, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

type Body = {
	invoiceReference?: string;
	invoiceAmount?: number;
	orderDate?: string;
	financingDate?: string;
	financingAmount?: number;
	deliveryDate?: string;
	deliveryAmount?: number;
	settlementDate?: string;
	isCancelled?: boolean;
	isManuallyVerified?: boolean;
	additionalInfo?: any;
	batchId?: string;
	supplierId?: number;
	buyerId?: number;
	financierId?: number;
	collectorId?: number;
	insurerId?: number;
	financialOfferId?: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	invoice: IInvoice;
}

export function useCancelInvoice(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "invoices", "cancel"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/invoices/cancel/${params.id}`);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
