import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
}

export function useDeleteFinancierOffer(params: Params, options?: MutationOptions<Response>) {
	const client = useAxios();
	const mutationKey = ["back-office", "suppliers", "contracts", "offers", "delete", params.id];

	const mutationFn = async () => {
		const { data: response } = await client.delete<Response>(`/backoffice/suppliers/contracts/offers/${params.id}`);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
