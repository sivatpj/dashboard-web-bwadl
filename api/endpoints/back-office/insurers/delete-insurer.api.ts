import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IInsurer, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	insurer: IInsurer;
}

export function useDeleteInsurer(params: Params, options?: MutationOptions<Response>) {
	const client = useAxios();
	const mutationKey = ["back-office", "insurers", "delete"];

	const mutationFn = async () => {
		const { data: response } = await client.delete<Response>(`/backoffice/insurers/${params.id}`);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
