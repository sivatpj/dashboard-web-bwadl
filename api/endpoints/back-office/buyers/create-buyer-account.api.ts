import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyerAccount, MutationOptions } from "@/api/types";
import { IQueryId } from "@/api/types/query-id";

interface Params {
	id: IQueryId;
}

type Body = {
	buyerNameEnglish: string;
	purpose: "cash" | "payable";
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	account: IBuyerAccount;
}

export function useCreateBuyerAccount(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "buyers", String(params.id), "accounts", "create"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/buyers/${params.id}/accounts`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
