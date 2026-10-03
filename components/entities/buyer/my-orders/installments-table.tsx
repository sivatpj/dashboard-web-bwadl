"use client";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { InstallmentDetails } from "@/components/entities/buyer/my-orders/installment-details";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

dayjs.extend(customParseFormat);

export const data = [
	{
		amount: "385",
		dueDate: "03 - May - 2025",
		dueIn: "9 days",
		installmentNumber: "(3/4)",
		merchant: "Arzaq Plus",
		orderNumber: "#105777",
		status: "Scheduled", // Scheduled, not overdue
	},
	{
		amount: "450",
		dueDate: "08 - May - 2025", // Adjusted to future date
		dueIn: "4 days",
		installmentNumber: "(7/8)",
		merchant: "binzagar",
		orderNumber: "#106000",
		status: "Scheduled", // Scheduled, not overdue
	},
	{
		amount: "450",
		dueDate: "11 - April - 2025",
		dueIn: "17 days overdue",
		installmentNumber: "(8/8)",
		merchant: "binzagar",
		orderNumber: "#106000",
		status: "Payment Overdue", // Overdue
	},
	{
		amount: "1200",
		dueDate: "13 - May - 2025", // Adjusted to future date
		dueIn: "15 days",
		installmentNumber: "(1/4)",
		merchant: "Arzaq Plus",
		orderNumber: "#109999",
		status: "Scheduled", // Scheduled, not overdue
	},
	{
		amount: "382",
		dueDate: "15 - April - 2025",
		dueIn: "3 days",
		installmentNumber: "(4/4)",
		merchant: "Arzaq Plus",
		orderNumber: "#105777",
		status: "Scheduled",
	},
	{
		amount: "500",
		dueDate: "20 - April - 2025",
		dueIn: "7 Days",
		installmentNumber: "(2/5)",
		merchant: "Extra Bahrain",
		orderNumber: "#107001",
		status: "Scheduled",
	},
	{
		amount: "600",
		dueDate: "25 - April - 2025",
		dueIn: "12 Days",
		installmentNumber: "(3/6)",
		merchant: "Jazeera Electronics",
		orderNumber: "#108002",
		status: "Paid",
	},
	{
		amount: "700",
		dueDate: "30 - April - 2025",
		dueIn: "17 Days",
		installmentNumber: "(4/8)",
		merchant: "Arzaq Plus",
		orderNumber: "#109003",
		status: "Overdue / Paid",
	},
	{
		amount: "800",
		dueDate: "05 - May - 2025",
		dueIn: "22 Days",
		installmentNumber: "(5/10)",
		merchant: "binzagar",
		orderNumber: "#110004",
		status: "Scheduled",
	},
];

export const InstallmentsTable = () => {
	return (
		<div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
			<Table className="w-full table-auto">
				<TableHeader className="bg-[#D9D9D9]">
					<TableRow className="h-12 text-center font-bold text-[#141919]">
						<TableHead className="text-center font-bold text-[#141919]"> </TableHead>
						<TableHead className="text-center font-bold text-[#141919]">Order Number</TableHead>
						<TableHead className="text-center font-bold text-[#141919]">Due Date</TableHead>
						<TableHead className="text-center font-bold text-[#141919]">Amount</TableHead>
						<TableHead className="text-center font-bold text-[#141919]">Due In</TableHead>
						<TableHead className="text-center font-bold text-[#141919]">Installment Number</TableHead>
						<TableHead className="text-center font-bold text-[#141919]">Merchant Name</TableHead>
						<TableHead className="text-center font-bold text-[#141919]">Status</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{data.map((item, i) => {
						const parsedDueDate = dayjs(item.dueDate, "DD - MMMM - YYYY");
						let dueIn = "Invalid date";
						let status = item.status;

						if (parsedDueDate.isValid()) {
							const now = dayjs();
							const diffDays = parsedDueDate.diff(now, "day");

							if (diffDays < 0) {
								dueIn = `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} (-)`;
								if (!status.toLowerCase().includes("paid")) {
									status = "Payment Overdue";
								}
							} else {
								dueIn = `${diffDays} day${diffDays === 1 ? "" : "s"}`;
							}
						}

						const isOverdue = status.toLowerCase().includes("overdue");

						const installmentMatch = item.installmentNumber.match(/^\((\d+)\/(\d+)\)$/);
						const currentInstallment = installmentMatch
							? Math.min(Math.max(parseInt(installmentMatch[1], 10), 1), 45)
							: 0;
						const totalInstallments = installmentMatch ? parseInt(installmentMatch[2], 10) : 0;

						const installmentNumber = `${currentInstallment}/${totalInstallments}`; // Convert back to string for display

						return (
							<InstallmentDetails
								key={i}
								amount={Number(item.amount)}
								date={item.dueDate}
								dueIn={dueIn}
								id={String(i)}
								installmentNumber={installmentNumber} // Pass as a string
								installments={data.map((d, index) => ({
									amount: Number(d.amount),
									dueDate: d.dueDate,
									id: String(index),
									status: d.status,
								}))}
								isOverdue={isOverdue} // Pass isOverdue as a prop
								merchant={{ logo: undefined, name: item.merchant }}
								orderNumber={Number(item.orderNumber.replace("#", ""))}
								status={status} // Use the updated status
							/>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
};
