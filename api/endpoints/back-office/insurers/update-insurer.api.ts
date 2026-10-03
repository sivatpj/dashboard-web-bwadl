import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IInsurer, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

type Body = {
	crNumber?: number;
	facilityName?: string;
	insurerName?: string;
	additionalInfo?: any;
	batchId?: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	insurer: IInsurer;
}

export function useUpdateInsurer(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "insurers", "update"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.put<Response>(`/backoffice/insurers/${params.id}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
