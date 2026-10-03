import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IFinancierSupplierContract, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	contract: IFinancierSupplierContract;
}

export function useDeleteFinancierSupplierContract(params: Params, options?: MutationOptions<Response>) {
	const client = useAxios();
	const mutationKey = ["back-office", "suppliers", "contracts", "delete", params.id];

	const mutationFn = async () => {
		const { data: response } = await client.delete<Response>(`/backoffice/suppliers/contracts/${params.id}`);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
