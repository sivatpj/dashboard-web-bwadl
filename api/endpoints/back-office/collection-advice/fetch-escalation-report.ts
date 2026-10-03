import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IEscalationReport, MutationOptions } from "@/api/types";

interface FetchEscalationReportBody {
	eligible_at?: string;
	page?: number;
	limit?: number;
}

interface FetchEscalationReportResponse {
	timestamp: number;
	success: boolean;
	reports: IEscalationReport[];
	totalCount: number;
}

export function useFetchEscalationReport(
	options?: MutationOptions<FetchEscalationReportResponse, FetchEscalationReportBody>,
) {
	const client = useAxios();
	const mutationKey = ["back-office", "collection-advice", "escalation-report"];

	const mutationFn = async (body: FetchEscalationReportBody) => {
		const { data: response } = await client.post<FetchEscalationReportResponse>(`/collection-advice/escalation-report`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
