import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";

interface Params {
	participantType: string;
}

export interface IParticipantOption {
	id: number;
	name: string | null;
	email: string | null;
}

interface Response {
	participants: IParticipantOption[];
}

export function useFetchParticipants(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["report-notification", "participants", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/report-notification/participants`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
