import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ISupplier, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

type Body = {
	crNumber?: number;
	facilityName?: string;
	supplierName?: string;
	//deliveryDateOffsetDays?: number;
	additionalInfo?: any;
	limit?: number;
	batchId?: string;
	allowsOverdraft?: boolean;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	supplier: ISupplier;
}

export function useUpdateSupplier(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "suppliers", "update"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.put<Response>(`/backoffice/suppliers/${params.id}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
