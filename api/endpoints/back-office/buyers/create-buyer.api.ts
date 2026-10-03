import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, MutationOptions } from "@/api/types";

type Body = {
	crNumber?: number;
	facilityName?: string;
	buyerName: string;
	creditLimit: number;
	repaymentPeriod: number;
	installmentNumber: number;
	contactNumber?: string;
	emailAddress?: string;
	buyerCategory?: string;
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

export function useCreateBuyer(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "buyers", "create"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/buyers`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
