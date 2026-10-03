import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

export type AccountInternalTransferBody = {
	fromParticipantId: number;
	fromParticipantType: "buyer" | "supplier" | "financier" | "collector" | "insurer" | "bwadl";
	fromAccountCode: string;
	toParticipantId: number;
	toParticipantType: "buyer" | "supplier" | "financier" | "collector" | "insurer" | "bwadl";
	toAccountCode: string;
	amount: number;
	currencyCode?: string; // default SAR on server
	referenceNumber?: string;
	notes: string;
	purposeTypeId?: number;
};

export interface AccountInternalTransferResponse {
	timestamp: number;
	success: boolean;
	message: string;
}

export function useAccountInternalTransfer(
	options?: MutationOptions<AccountInternalTransferResponse, AccountInternalTransferBody>,
) {
	const client = useAxios();
	const mutationKey = ["back-office", "transfers", "account-internal-transfer"];
	const mutationFn = async (body: AccountInternalTransferBody) => {
		const { data } = await client.post<AccountInternalTransferResponse>(
			`/backoffice/banks/account-internal-transfer`,
			body,
		);
		return data;
	};
	return useMutation({ mutationFn, mutationKey, ...options });
}
