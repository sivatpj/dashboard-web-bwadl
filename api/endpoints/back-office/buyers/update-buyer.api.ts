import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

type Body = {
	crNumber?: number;
	facilityName?: string;
	buyerName?: string;
	creditLimit?: number;
	repaymentPeriod?: number;
	installmentNumber?: number;
	additionalInfo?: any;
	batchId?: string;
	references?: Array<{
		participantId: number;
		participantBuyerReference: string;
	}>;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	buyer: IBuyer;
}

export function useUpdateBuyer(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "buyers", "update"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.put<Response>(`/backoffice/buyers/${params.id}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
