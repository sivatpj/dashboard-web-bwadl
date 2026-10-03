import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBank, MutationOptions } from "@/api/types";

type Body = {
	date: string;
	capital: number;
	transferred: number;
	expenses: number;
	description?: string;
	bankBalance: number;
	additionalInfo?: any;
	batchId?: string;
	financierId: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	bank: IBank;
}

export function usePersistBank(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "banks", "persist"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/banks`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
