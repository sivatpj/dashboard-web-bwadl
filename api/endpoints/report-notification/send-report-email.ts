import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface Body {
	file: Blob;
	participantType: string;
	participantId: number;
	notificationCode: string;
	language?: string;
	email?: string;
	notificationInput: Record<string, unknown>;
}

interface Response {
	message: string;
	to: string;
}

export function useSendReportEmail(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["report-notification", "send"];

	const mutationFn = async (body: Body) => {
		const formData = new FormData();
		formData.append("file", body.file, "overdue-sales-orders-report.pdf");
		formData.append("participantType", body.participantType);
		formData.append("participantId", String(body.participantId));
		formData.append("notificationCode", body.notificationCode);
		if (body.language) formData.append("language", body.language);
		if (body.email) formData.append("email", body.email);
		formData.append("notificationInput", JSON.stringify(body.notificationInput));

		const { data: response } = await client.post<Response>(`/report-notification/send`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
