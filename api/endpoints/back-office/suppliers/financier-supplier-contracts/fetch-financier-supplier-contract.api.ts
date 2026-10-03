import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import {
	IBuyer,
	ICollection,
	IFinancier,
	IFinancierOffer,
	IFinancierSupplierContract,
	IInvoice,
	ISupplier,
	QueryOptions,
} from "@/api/types";

type Params = {
	id: number;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	contract: IFinancierSupplierContract & {
		financierOffers: IFinancierOffer[];
		financier: IFinancier;
		supplier: ISupplier;
		invoices: Array<
			IInvoice & {
				collections: ICollection[];
				buyer: IBuyer;
			}
		>;
	};
}

export function useFetchFinancierSupplierContract(params: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "suppliers", "contracts", params.id];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/suppliers/contracts/${params.id}`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
