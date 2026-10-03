import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBankEntity, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

export type UpdateBankEntityBody = {
	bankName?: string;
	address?: string;
	accountHolderName?: string;
	accountNumber?: string;
	iban?: string;
	shortName?: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	bank: IBankEntity;
}

export function useUpdateBankEntity(params: Params, options?: MutationOptions<Response, UpdateBankEntityBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "bank-entities", "update"];

	const mutationFn = async (body: UpdateBankEntityBody) => {
		const { data: response } = await client.put<Response>(`/backoffice/banks/entities/${params.id}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
