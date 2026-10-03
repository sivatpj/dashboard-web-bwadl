import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

type InstallmentsUploadBody = Array<{
	installmentId: number;
	paidAmount: number;
	paidDate: string;
}>;

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
}

export function useInstallmentsUpload(options?: MutationOptions<Response, InstallmentsUploadBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "installments-upload"];

	const mutationFn = async (body: InstallmentsUploadBody) => {
		const { data: response } = await client.post<Response>(`/backoffice/invoices/reallocate-collections`, {
			rows: body,
		});

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
