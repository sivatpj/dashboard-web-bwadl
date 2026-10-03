import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";

type MissingCRsBody = Array<{
	crNumber: number;
}>;

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	missing: {
		count: number;
		crNumbers: number[];
	};
}

export function useMissingCRs(body: MissingCRsBody, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "missing-crs", body];

	const queryFn = async () => {
		const { data: response } = await client.post<Response>(`/backoffice/missingcrs`, body);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
