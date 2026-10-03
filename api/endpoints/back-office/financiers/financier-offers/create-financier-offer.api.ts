import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IFinancierOffer, MutationOptions } from "@/api/types";

type Body = {
	financierSupplierContractId: number;
	offerUniqueReference: string;
	offerName?: string;
	financingDateOffsetDays: number;
	paymentDateOffsetDays: number;
	deliveryDateOffsetDays: number;
	financierShare: number;
	supplierShare: number;
	collectorShare: number;
	insurerShare: number;
	bwadlShare: number;
	financierCancellationFees: number;
	supplierCancellationFees: number;
	collectorCancellationFees: number;
	insurerCancellationFees: number;
	bwadlCancellationFees: number;
	repaymentPeriod: number;
	installmentNumber: number;
	financingDateOffsetFrom: "order_date" | "delivery_date";
	supplierAdvancePercentage?: number;
	isPreDeliveryOnly: boolean;
	postDeliveryFinancierDiscount: number;
	status?: "open" | "closed";
	batchId?: string;
	additionalInfo?: any;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	offer: IFinancierOffer;
}

export function useCreateFinancierOffer(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "financiers", "offers", "create"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/financiers/offers`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
