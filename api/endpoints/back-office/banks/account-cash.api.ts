import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IJournalEntry, MutationOptions } from "@/api/types";

export type AccountCashBody = {
	participantId: number;
	participantType: "buyer" | "supplier" | "financier" | "collector" | "insurer" | "bwadl";
	amount: number;
	accountCode: string;
	bankAccountCode: string;
	currencyCode?: string; // default SAR on server
	referenceNumber?: string;
	date?: string;
	notes: string;
	purposeTypeId?: number;
};

export interface AccountCashResponse {
	timestamp: number;
	success: boolean;
	message: string;
	id?: number;
	journalEntry?: IJournalEntry;
	transaction?: IJournalEntry;
}

export function useAccountCashIn(options?: MutationOptions<AccountCashResponse, AccountCashBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "banks", "account-cash-in"];
	const mutationFn = async (body: AccountCashBody) => {
		const { data } = await client.post<AccountCashResponse>(`/backoffice/banks/account-cash-in`, body);
		return data;
	};
	return useMutation({ mutationFn, mutationKey, ...options });
}

export function useAccountCashOut(options?: MutationOptions<AccountCashResponse, AccountCashBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "banks", "account-cash-out"];
	const mutationFn = async (body: AccountCashBody) => {
		const { data } = await client.post<AccountCashResponse>(`/backoffice/banks/account-cash-out`, body);
		return data;
	};
	return useMutation({ mutationFn, mutationKey, ...options });
}
