import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { IBuyerFinancierLimit, MutationOptions } from "@/api/types";

type Params = {
	id: number;
	financierId: number;
};

type Body = {
	creditLimit?: number;
	repaymentPeriod?: number;
	installmentNumber?: number;
	setAndUseLimit?: boolean;
};

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	financierLimit: IBuyerFinancierLimit;
}

export function useUpdateBuyerFinancierLimit(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "buyers", String(params.id), "financier-limits", String(params.financierId), "update"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.put<Response>(
			`/backoffice/buyers/${params.id}/financier-limits/${params.financierId}`,
			body,
		);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
