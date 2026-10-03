import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

type OrdersUploadBody = Array<{
	orderNumber: string;
	orderDate: string;
	orderAmount: number;
	deliveryDate: string | null;
	installmentNumber: number;
	installmentAmount: number;
	totalPaidAmount: number;
	crNumber: number;
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
					[orders: string]: string;
				};
				insertedIds: {
					[orders: string]: string;
				};
			};
		};
		details: Array<{
			crNumber: string;
			order_number: string;
			operation: string;
		}>;
	};
}

export function useOrdersUpload(options?: MutationOptions<Response, OrdersUploadBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "orders-upload"];

	const mutationFn = async (body: OrdersUploadBody) => {
		const { data: response } = await client.post<Response>(`/backoffice/orders-upload`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
