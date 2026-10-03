import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ICollection, MutationOptions } from "@/api/types";

type Params = {
	id?: number;
};

type Body = {
	appliedAmount?: number;
	subAdjustments?: string;
	reason?: string;
	terminalId?: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	collection: ICollection;
}

export function usePersistCollection(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collections", "persist"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/collections/${params.id}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
