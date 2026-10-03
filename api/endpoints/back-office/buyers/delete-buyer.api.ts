import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	buyer: IBuyer;
}

export function useDeleteBuyer(params: Params, options?: MutationOptions<Response>) {
	const client = useAxios();
	const mutationKey = ["back-office", "buyers", "delete"];

	const mutationFn = async () => {
		const { data: response } = await client.delete<Response>(`/backoffice/buyers/${params.id}`);
		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
