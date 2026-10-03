import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBank, IFinancier, IFinancierOffer, IFinancierSupplierContract, ISupplier, QueryOptions } from "@/api/types";
import { IQueryId } from "@/api/types/query-id";

interface Params {
	id: IQueryId;
	contractsQ?: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	financier: IFinancier & {
		banks: [IBank | undefined];
		financierSupplierContracts: Array<
			IFinancierSupplierContract & {
				supplier: ISupplier;
				financierOffers: IFinancierOffer[];
			}
		>;
	};
}

export function useFetchFinancier(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "financiers", params.id, params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/financiers/${params.id}`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
