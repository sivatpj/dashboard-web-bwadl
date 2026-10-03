import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IFinancierSupplierContract, MutationOptions } from "@/api/types";

type Body = {
	name: string;
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

export function usePersistFinancierSupplierContract(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "suppliers", "contracts", "persist"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/suppliers/contracts`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
