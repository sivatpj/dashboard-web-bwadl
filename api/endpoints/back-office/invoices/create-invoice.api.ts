import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IInvoice, MutationOptions } from "@/api/types";

type Body = {
	invoiceReference?: string;
	reference?: string;
	invoiceAmount: number;
	amount?: number;
	orderDate?: string;
	financingDate?: string;
	financingAmount?: number;
	deliveryDate?: string;
	deliveryAmount?: number;
	settlementDate?: string;
	isFinal?: boolean;
	isCancelled?: boolean;
	isManuallyVerified?: boolean;
	additionalInfo?: any;
	batchId?: string;
	supplierId: number;
	buyerId: number;
	financierId: number;
	collectorId: number;
	insurerId: number;
	financialOfferId: number;
	salesOrderId: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	invoice: IInvoice;
}

export function useCreateInvoice(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "invoices", "create"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/invoices`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
