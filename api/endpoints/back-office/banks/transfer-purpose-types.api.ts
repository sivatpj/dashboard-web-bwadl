import { useMutation, useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions, QueryOptions } from "@/api/types";

export interface ITransferPurposeType {
	id: number;
	purposeType: string;
	dateCreated: string;
	dateModified: string;
}

interface FetchTransferPurposeTypesResponse {
	purposeTypes: ITransferPurposeType[];
}

export function useFetchTransferPurposeTypes(options?: QueryOptions<FetchTransferPurposeTypesResponse>) {
	const client = useAxios();
	const queryKey = ["back-office", "banks", "purpose-types"];

	const queryFn = async () => {
		const { data } = await client.get<FetchTransferPurposeTypesResponse>("/backoffice/banks/purpose-types");
		return data;
	};

	return useQuery({ queryFn, queryKey, ...options });
}

export type CreateTransferPurposeTypeBody = {
	purposeType: string;
};

interface CreateTransferPurposeTypeResponse {
	purposeType: ITransferPurposeType;
}

export function useCreateTransferPurposeType(
	options?: MutationOptions<CreateTransferPurposeTypeResponse, CreateTransferPurposeTypeBody>,
) {
	const client = useAxios();
	const mutationKey = ["back-office", "banks", "purpose-types", "create"];
	const mutationFn = async (body: CreateTransferPurposeTypeBody) => {
		const { data } = await client.post<CreateTransferPurposeTypeResponse>("/backoffice/banks/purpose-types", body);
		return data;
	};
	return useMutation({ mutationFn, mutationKey, ...options });
}

interface DeleteTransferPurposeTypeResponse {
	success: boolean;
}

export function useDeleteTransferPurposeType(
	options?: MutationOptions<DeleteTransferPurposeTypeResponse, number>,
) {
	const client = useAxios();
	const mutationKey = ["back-office", "banks", "purpose-types", "delete"];
	const mutationFn = async (id: number) => {
		const { data } = await client.delete<DeleteTransferPurposeTypeResponse>(`/backoffice/banks/purpose-types/${id}`);
		return data;
	};
	return useMutation({ mutationFn, mutationKey, ...options });
}
