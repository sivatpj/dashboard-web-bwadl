import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { ICollector, MutationOptions } from "@/api/types";

type Body = {
	crNumber: number;
	facilityName?: string;
	collectorName: string;
	additionalInfo?: any;
	batchId?: string;
	allowsOverdraft?: boolean;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	collector: ICollector;
}

export function useCreateCollector(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "collectors", "create"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/collectors`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
