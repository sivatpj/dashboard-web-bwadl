import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IParticipantDefaults, MutationOptions } from "@/api/types";

type Body = {
	participantType: IParticipantDefaults["participantType"];
	participantId: number;
	financierOfferId?: number;
	collectorId?: number;
	insurerId?: number;
	bwadlId?: number;
	supplierId?: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	participantDefaults: IParticipantDefaults;
}

export function useUpsertParticipantDefaults(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "participant-defaults", "upsert"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/backoffice/participant-defaults`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
