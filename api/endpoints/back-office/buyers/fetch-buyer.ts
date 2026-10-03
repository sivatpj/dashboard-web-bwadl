import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer, IBuyerAccount, IParticipantAccount, QueryOptions } from "@/api/types";
import { IQueryId } from "@/api/types/query-id";

interface Params {
	id: IQueryId;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	buyer: IBuyer & {
		participantBuyerReferences: IParticipantAccount[];
		participantAccounts: IBuyerAccount[];
	};
}

export function useFetchBuyer(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "buyers", String(params.id), params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/buyers/${params.id}`, {
			params,
		});

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
