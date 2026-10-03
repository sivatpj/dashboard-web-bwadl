import { useMutation, useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions, QueryOptions } from "@/api/types";

export type ParticipantType = "buyer" | "supplier" | "financier" | "collector" | "insurer" | "bwadl";

export interface IBankAccount {
	accountId: number;
	accountCode: string;
	accountName: string;
	bankCode: string | null;
	bankName: string | null;
	shortName: string | null;
	iban: string | null;
}

interface BanksResponse {
	timestamp: number;
	success: boolean;
	message: string;
	banks: IBankAccount[];
}

export function useFetchBankAccounts(options?: QueryOptions<BanksResponse>) {
	const client = useAxios();
	const queryKey = ["back-office", "banks", "accounts"];

	const queryFn = async () => {
		const { data } = await client.get<BanksResponse>(`/backoffice/banks/accounts`);

		return data;
	};

	return useQuery({
		queryFn,
		queryKey,
		staleTime: 30_000,
		...options,
	});
}

export interface IBankReferenceAccount {
	id: number;
	accountCode: string;
	participantId: number;
	participantType: string;
	purpose: string;
	v: number;
	isCurrent: boolean;
	batchId: string | null;
	createdAt: string;
	updatedAt: string;
	accountDescription: string | null;
	accountName: string;
	accountType: string;
	currencyCode: string;
	createdBy: string;
	createdByName?: string;
	updatedBy: string;
	updatedByName?: string;
	bankCode: string | null;
	bankName: string | null;
	shortName: string | null;
	iban: string | null;
}

interface BankReferencesResponse {
	timestamp: number;
	success: boolean;
	message: string;
	references: IBankReferenceAccount[];
}

export function useFetchBankReferenceAccounts(
	participantId?: number,
	participantType?: ParticipantType,
	options?: QueryOptions<BankReferencesResponse>,
) {
	const client = useAxios();
	const queryKey = ["back-office", "banks", "accounts", "reference", participantId, participantType];

	const queryFn = async () => {
		if (!participantId || !participantType) {
			return { message: "", references: [], success: true, timestamp: Date.now() };
		}

		const { data } = await client.get<BankReferencesResponse>(
			`/backoffice/banks/accounts/reference/${participantId}/${participantType}`,
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

type CreateBankReferenceBody = {
	participantId: number;
	participantType: ParticipantType;
	accountCode: string;
};

interface CreateBankReferenceResponse {
	timestamp: number;
	success: boolean;
	message: string;
	reference: {
		id: number;
		accountCode: string;
		participantId: number;
		participantType: string;
		purpose: string;
	};
}

export function useCreateBankReference(options?: MutationOptions<CreateBankReferenceResponse, CreateBankReferenceBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "banks", "accounts", "reference", "create"];

	const mutationFn = async (body: CreateBankReferenceBody) => {
		const { data: response } = await client.post<CreateBankReferenceResponse>(`/backoffice/banks/accounts/reference`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}

type DeleteBankReferenceBody = {
	participantId: number;
	participantType: ParticipantType;
	accountCode: string;
};

interface DeleteBankReferenceResponse {
	timestamp: number;
	success: boolean;
	message: string;
	reference: {
		id: number;
		accountCode: string;
		participantId: number;
		participantType: string;
		purpose: string;
	};
}

export function useDeleteBankReference(options?: MutationOptions<DeleteBankReferenceResponse, DeleteBankReferenceBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "banks", "accounts", "reference", "delete"];

	const mutationFn = async (body: DeleteBankReferenceBody) => {
		const { data: response } = await client.delete<DeleteBankReferenceResponse>(
			`/backoffice/banks/accounts/reference/${body.participantId}/${body.participantType}/${encodeURIComponent(body.accountCode)}`,
		);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
