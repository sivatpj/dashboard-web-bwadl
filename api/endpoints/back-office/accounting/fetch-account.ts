import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IAccount, IQueryId, QueryOptions } from "@/api/types";

interface Params {
	id: IQueryId;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	account: IAccount;
}

export function useFetchAccountingAccount(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "accounting", "accounts", params.id];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/accounting/accounts/${params.id}`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
