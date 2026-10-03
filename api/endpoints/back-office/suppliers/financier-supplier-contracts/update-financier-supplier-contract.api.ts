import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IFinancierSupplierContract, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

type Body = {
	name?: string;
	//supplierAdvancePercentage?: number;
	advanceCap?: number;
	availableAdvance?: number;
	additionalInfo?: any;
	batchId?: string;
	financierId: number;
	supplierId: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	contract: IFinancierSupplierContract;
}

export function useUpdateFinancierSupplierContract(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "suppliers", "contracts", "update", params.id];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.put<Response>(`/backoffice/suppliers/contracts/${params.id}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
