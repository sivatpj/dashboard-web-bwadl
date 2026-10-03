import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";

export interface IAccountTransfer {
	transferId: number;
	transferType: string;
	transferNote: string | null;
	fromAccountId: number | null;
	toAccountId: number | null;
	amount: number;
	journalEntryId: number | null;
	purposeTypeId: number | null;
	purposeType: string | null;
	createdAt: string;
	createdBy: any;
}

interface FetchTransfersParams {
	page?: number;
	limit?: number;
	from?: string;
	to?: string;
	transferType?: string;
	purposeTypeId?: number;
}

interface FetchTransfersResponse {
	transfers: IAccountTransfer[];
	totalCount: number;
}

export function useFetchTransfers(params?: FetchTransfersParams, options?: QueryOptions<FetchTransfersResponse>) {
	const client = useAxios();
	const queryKey = ["back-office", "transfers", params];

	const queryFn = async () => {
		const { data } = await client.get<FetchTransfersResponse>("/backoffice/transfers", { params });
		return data;
	};

	return useQuery({ queryFn, queryKey, ...options });
}

interface FetchTransferByIdResponse {
	transfer: IAccountTransfer;
}

export function useFetchTransferById(id?: number, options?: QueryOptions<FetchTransferByIdResponse>) {
	const client = useAxios();
	const queryKey = ["back-office", "transfers", id];

	const queryFn = async () => {
		if (!id) throw new Error("Transfer ID is required");
		const { data } = await client.get<FetchTransferByIdResponse>(`/backoffice/transfers/${id}`);
		return data;
	};

	return useQuery({ enabled: Boolean(id), queryFn, queryKey, ...options });
}
