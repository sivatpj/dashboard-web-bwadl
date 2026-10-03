import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IParticipantDefaults, QueryOptions } from "@/api/types";
import { IQueryId } from "@/api/types/query-id";

interface Params {
	id: IQueryId;
	type: IParticipantDefaults["participantType"];
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	participantDefaults: IParticipantDefaults;
}

export function useFetchParticipantDefaults(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "participant-defaults", String(params.id), params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(
			`/backoffice/participant-defaults/${params.type}/${params.id}`,
		);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
