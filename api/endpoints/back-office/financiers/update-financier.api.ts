import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IFinancier, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

type Body = {
	crNumber?: number;
	facilityName?: string;
	financierName?: string;
	additionalInfo?: any;
	batchId?: string;
	limit?: number;
	contactNumber?: string;
	email?: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	financier: IFinancier;
}

export function useUpdateFinancier(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "financiers", "update"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.put<Response>(`/backoffice/financiers/${params.id}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
