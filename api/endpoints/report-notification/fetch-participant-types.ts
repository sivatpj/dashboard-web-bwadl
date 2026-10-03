import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";

interface Response {
	participantTypes: string[];
}

export function useFetchParticipantTypes(options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["report-notification", "participant-types"];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/report-notification/participant-types`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
