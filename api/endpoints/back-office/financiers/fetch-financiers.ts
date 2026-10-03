import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBank, IFinancier, IFinancierOffer, IFinancierSupplierContract, QueryOptions } from "@/api/types";

interface Params {
	page?: number;
	limit?: number;
	q?: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	totalCount: number;
	financiers: Array<
		IFinancier & {
			banks: [IBank | undefined];
			financierSupplierContracts: Array<
				IFinancierSupplierContract & {
					financierOffers: IFinancierOffer[];
				}
			>;
		}
	>;
}

export function useFetchFinanciers(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "financiers", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/financiers`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
