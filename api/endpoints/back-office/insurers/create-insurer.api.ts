import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IInsurer, MutationOptions } from "@/api/types";

type Body = {
	crNumber: number;
	facilityName?: string;
	insurerName: string;
	additionalInfo?: any;
	batchId?: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	insurer: IInsurer;
}

export function useCreateInsurer(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "insurers", "create"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/insurers`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
