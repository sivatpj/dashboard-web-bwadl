import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	results: Array<{
		id: number;
		batchId: string;
		crNumber: string;
		order_number: string;
		installment_due_date: string;
		installment_amount: string;
		paid_amount: string;
		paid_date: string | null;
		installment_status: string;
		is_active: boolean;
		createdAt: string;
		updatedAt: string;
	}>;
}

export function useInstallmentsDownload(options?: MutationOptions<Response>) {
	const client = useAxios();
	const mutationKey = ["back-office", "installments-download"];

	const mutationFn = async () => {
		const { data: response } = await client.get<Response>(`/backoffice/installments-download`);

		const results = response.results;

		const worksheet = XLSX.utils.json_to_sheet(
			results.map(installment => ({
				"CR Number": installment.crNumber,
				ID: installment.id,
				"Installment amount": installment.installment_amount,
				"Installment due date": new Date(installment.installment_due_date).toLocaleDateString(),
				"Is deleted": installment.is_active ? "No" : "Yes",
				"Order Number": installment.order_number,
				"Paid Amount": installment.paid_amount,
				"Paid Date": installment.paid_date ? new Date(installment.paid_date).toLocaleDateString() : "",
				"Status [computed]": installment.installment_status,
			})),
		);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Installments");
		const fileName = `installments_${dayjs().format("DD-MM-YYYY-Hh-Mm")}.xlsx`;
		XLSX.writeFile(workbook, fileName);
		const file = new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "binary" })], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		const url = URL.createObjectURL(file);
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		document.body.removeChild(a);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
