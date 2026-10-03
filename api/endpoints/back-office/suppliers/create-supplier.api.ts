import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ISupplier, MutationOptions } from "@/api/types";

type Body = {
	crNumber: number;
	facilityName?: string;
	supplierName: string;
	//deliveryDateOffsetDays: number;
	additionalInfo?: any;
	limit: number;
	batchId?: string;
	allowsOverdraft?: boolean;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	supplier: ISupplier;
}

export function useCreateSupplier(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "suppliers", "create"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/suppliers`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
