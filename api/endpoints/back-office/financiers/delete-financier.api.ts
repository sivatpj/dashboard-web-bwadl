import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IFinancier, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	financier: IFinancier;
}

export function useDeleteFinancier(params: Params, options?: MutationOptions<Response>) {
	const client = useAxios();
	const mutationKey = ["back-office", "financiers", "delete"];

	const mutationFn = async () => {
		const { data: response } = await client.delete<Response>(`/backoffice/financiers/${params.id}`);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
