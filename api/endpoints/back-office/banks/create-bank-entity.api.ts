import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBankEntity, MutationOptions } from "@/api/types";

export type CreateBankEntityBody = {
	bankCode: string;
	bankName: string;
	address?: string;
	accountHolderName?: string;
	accountNumber?: string;
	iban?: string;
	shortName: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	bank: IBankEntity;
	account: { id: number; accountCode: string };
}

export function useCreateBankEntity(options?: MutationOptions<Response, CreateBankEntityBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "bank-entities", "create"];

	const mutationFn = async (body: CreateBankEntityBody) => {
		const { data: response } = await client.post<Response>(`/backoffice/banks/entities`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
