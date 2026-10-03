import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

type BuyersUploadBody = Array<{
	crName: string;
	crNumber: number;
	creditLimit: number;
	repaymentPeriod: number;
	installmentNumber: number;
	officePhone: string;
	crAddress: string;
	isActive: boolean;
}>;

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	report: {
		summary: {
			dbSummary: {
				updated: number;
				inserted: number;
				total: number;
			};
			documentSummary: {
				insertedCount: number;
				matchedCount: number;
				modifiedCount: number;
				deletedCount: number;
				upsertedCount: number;
				upsertedIds: {
					[crNumber: string]: string;
				};
				insertedIds: {
					[crNumber: string]: string;
				};
			};
		};
		details: Array<{
			crNumber: string;
			operation: string;
		}>;
	};
}

export function useBuyersUpload(options?: MutationOptions<Response, BuyersUploadBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "buyers-upload"];

	const mutationFn = async (body: BuyersUploadBody) => {
		const { data: response } = await client.post<Response>(`/backoffice/buyers-upload`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
