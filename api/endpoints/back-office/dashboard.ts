import { QueryOptions, useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	data: {
		financedAmount: number;
		collectedAmount: number;
		actualBalance: number;
		bankBalance: number;
		invoicesPerMonth: Array<{
			month: string;
			count: number;
		}>;
		capital: number;
		availableCapital: number;
		usedCapital: number;
		revenue: {
			q1: number;
			q2: number;
			q3: number;
			q4: number;
			total: number;
		};
		buyersPerMonth: Array<{
			month: string;
			count: number;
		}>;
	};
}

export function useDashboard(options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "dashboard"];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/dashboard`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
