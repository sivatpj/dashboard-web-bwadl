import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

type Params = {
	buyerId: number;
};

type Body = {
	amount: number;
	appliedAt?: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
}

export function useBuyerBulkPayment(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collections", "buyer-bulk-payment", params.buyerId];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(
			`/backoffice/collections/buyer/${params.buyerId}/bulk-payment`,
			body,
		);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
