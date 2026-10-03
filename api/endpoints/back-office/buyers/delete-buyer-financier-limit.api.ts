import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

type Params = {
	id: number;
	financierId: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
}

export function useDeleteBuyerFinancierLimit(params: Params, options?: MutationOptions<Response, void>) {
	const client = useAxios();
	const mutationKey = ["back-office", "buyers", String(params.id), "financier-limits", String(params.financierId), "delete"];

	const mutationFn = async () => {
		const { data: response } = await client.delete<Response>(
			`/backoffice/buyers/${params.id}/financier-limits/${params.financierId}`,
		);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
