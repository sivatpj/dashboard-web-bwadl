import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IPaymentTransaction, MutationOptions } from "@/api/types";

interface Response {
	timestamp: number;
	success: boolean;
	paymentTransaction: IPaymentTransaction;
}

export function useReversePaymentTransaction(options?: MutationOptions<Response, number>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collections", "reverse-payment-transaction"];

	const mutationFn = async (paymentTransactionId: number) => {
		const { data: response } = await client.post<Response>(`/backoffice/collections/${paymentTransactionId}/reverse`);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
