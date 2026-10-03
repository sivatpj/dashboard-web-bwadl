import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ISupplier, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	supplier: ISupplier;
}

export function useDeleteSupplier(params: Params, options?: MutationOptions<Response>) {
	const client = useAxios();
	const mutationKey = ["back-office", "suppliers", "delete"];

	const mutationFn = async () => {
		const { data: response } = await client.delete<Response>(`/backoffice/suppliers/${params.id}`);
		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
