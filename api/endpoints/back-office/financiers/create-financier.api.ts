import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IFinancier, MutationOptions } from "@/api/types";

type Body = {
	crNumber: number;
	facilityName?: string;
	financierName: string;
	additionalInfo?: any;
	batchId?: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	financier: IFinancier;
}

export function useCreateFinancier(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "financiers", "create"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/financiers`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
