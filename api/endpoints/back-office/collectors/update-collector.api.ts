import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ICollector, MutationOptions } from "@/api/types";

type Params = {
	id: number;
};

type Body = {
	crNumber?: number;
	facilityName?: string;
	collectorName?: string;
	additionalInfo?: any;
	allowsOverdraft?: boolean;
	batchId?: string;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	collector: ICollector;
}

export function useUpdateCollector(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collectors", "update"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.put<Response>(`/backoffice/collectors/${params.id}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
