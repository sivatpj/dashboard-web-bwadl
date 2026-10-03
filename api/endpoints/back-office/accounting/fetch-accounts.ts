import { useMutation, useQuery } from "@tanstack/react-query";
import { AccountCashBody } from "@/api/endpoints/back-office/banks/account-cash.api";
import { useAxios } from "@/api/hooks/axios";
import { IAccount, IAccountWithParticipants, MutationOptions, QueryOptions } from "@/api/types";

interface Params {
	page?: number;
	limit?: number;
	q?: string;
	from?: string;
	to?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	accounts: IAccountWithParticipants[];
}

interface StatementResponse {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	accounts: IAccount[];
}

export function useFetchAccountingAccounts(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "accounting", "accounts", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/accounting/accounts`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}

export function useFetchAccountsForStatement(params?: Params, options?: QueryOptions<StatementResponse>) {
	const client = useAxios();
	const queryKey = ["back-office", "accounting", "accounts", "statement", params];

	const queryFn = async () => {
		const { data: response } = await client.get<StatementResponse>(`/backoffice/accounting/accounts/statement`, {
			params,
		});

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}

export interface UpdateAccountOverdraftBody {
	allowsOverdraft: boolean;
	overdraftLimit?: number | null;
}

interface UpdateAccountOverdraftResponse {
	timestamp: number;
	success: boolean;
	message: string;
	account: IAccount;
}

export function useUpdateAccountOverdraft(
	accountId?: number,
	options?: MutationOptions<UpdateAccountOverdraftResponse, UpdateAccountOverdraftBody>,
) {
	const client = useAxios();
	const mutationKey = ["back-office", "accounting", "accounts", "update-overdraft", accountId];

	const mutationFn = async (body: UpdateAccountOverdraftBody) => {
		const { data } = await client.patch<UpdateAccountOverdraftResponse>(
			`/backoffice/accounting/accounts/${accountId}/overdraft`,
			body,
		);

		return data;
	};

	return useMutation({ mutationFn, mutationKey, ...options });
}

interface ParticipantAccountsParams {}

interface ParticipantAccountsResponse {
	timestamp: number;
	success: boolean;
	message: string;
	accounts: Array<{
		id: number;
		accountCode: string;
		participantId: number;
		participantType: string;
		v: number;
		purpose: string;
		isCurrent: boolean;
		batchId: number | null;
		createdAt: string;
		updatedAt: string;
	}>;
}

export function useFetchAccountsByParticipant(
	participantId?: number,
	participantType?: AccountCashBody["participantType"],
	params?: ParticipantAccountsParams,
	options?: QueryOptions<ParticipantAccountsResponse>,
) {
	const client = useAxios();
	const queryKey = ["back-office", "accounting", "accounts", "participant", participantId, participantType, params];

	const queryFn = async () => {
		if (!participantId || !participantType) {
			return {
				accounts: [],
				message: "",
				success: true,
				timestamp: Date.now(),
			};
		}

		const { data } = await client.get<ParticipantAccountsResponse>(
			`/backoffice/accounting/accounts/${participantId}/${participantType}`,
			{ params },
		);

		return data;
	};

	return useQuery({
		enabled: Boolean(participantId && participantType),
		queryFn,
		queryKey,
		staleTime: 30_000,
		...options,
	});
}
