import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IFinancier, IFinancierOffer, IFinancierSupplierContract, ISupplier, QueryOptions } from "@/api/types";
import { IQueryId } from "@/api/types/query-id";

interface Params {
	id: IQueryId;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	supplier: ISupplier & {
		financierSupplierContracts: Array<
			IFinancierSupplierContract & {
				financier: IFinancier;
				financierOffers: IFinancierOffer[];
			}
		>;
	};
}

export function useFetchSupplier(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "suppliers", params.id, params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/suppliers/${params.id}`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
