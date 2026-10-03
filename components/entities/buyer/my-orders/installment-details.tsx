"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { Icon } from "@/components/global/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InstallmentProgressBar } from "@/components/ui/InstallmentProgressBar";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

interface InstallmentDetailsProps {
	id: string;
	date: string;
	orderNumber: number;
	amount: number;
	status: string;
	merchant: {
		name: string;
		logo?: string;
	};
	installments: Array<{
		id: string;
		dueDate: string;
		amount: number;
		status: string;
	}>;
	installmentNumber: string;
	dueIn: string;
	isOverdue: boolean;
}

export const InstallmentDetails = (props: InstallmentDetailsProps) => {
	const { status, amount, id, merchant, installments, orderNumber, installmentNumber } = props;

	const [expandedInstallment, setExpandedInstallment] = useState<string | null>(null);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<TableRow className="cursor-pointer text-sm text-[#404040] transition hover:bg-gray-100">
					<TableCell className="text-center">
						{props.isOverdue && <Icon className="mx-auto h-4 w-4" name="Warning" />}
					</TableCell>
					<TableCell className={cn("text-center font-semibold", props.isOverdue && "text-[#E55757]")}>
						#{orderNumber}
					</TableCell>
					<TableCell className={cn("text-center font-semibold", props.isOverdue && "text-[#E55757]")}>
						{props.date}
					</TableCell>
					<TableCell className="text-center">
						<div className="flex items-center justify-center gap-1">
							<Icon className="h-3 w-3" name="Riyal" />
							{formatCurrency(amount)}
						</div>
					</TableCell>
					<TableCell className="text-center font-medium">
						<span className={cn(props.isOverdue ? "text-[#E55757]" : "text-[#141919]")}>{props.dueIn}</span>
					</TableCell>
					<TableCell className="text-center">{installmentNumber}</TableCell> {/* Display as a string */}
					<TableCell className={cn("text-center", props.isOverdue && "text-[#E55757]")}>{merchant.name}</TableCell>
					<TableCell className="text-center">
						<span
							className={cn(
								"inline-block rounded-full px-3 py-1 text-xs font-medium",
								status === "Payment Overdue" && "bg-[#E55757] text-white",
								status === "Scheduled" && "border border-[#AC7500] bg-white text-[#242424]",
								status === "Paid" && "border border-[#009A40] bg-white text-[#000]",
								status === "Overdue / Paid" && "border border-[#E55757] bg-white text-[#E55757]",
							)}
						>
							{status}
						</span>
					</TableCell>
				</TableRow>
			</DialogTrigger>

			<DialogContent className="w-full max-w-[72vw] rounded-2xl border-none bg-[#F0F8FD] px-8 py-6 shadow-xl">
				<DialogHeader>
					<DialogTitle className="text-[2.1rem] font-bold text-[#141919]">Installment Details</DialogTitle>{" "}
					{/* Increased font size */}
				</DialogHeader>

				<div className="mt-4 flex max-h-[54vh] flex-col gap-6 overflow-auto bg-[#FFFFFF] p-3 pt-6 text-[1.265rem]">
					{/* Increased font size by 15% */}
					<div className="flex gap-8">
						{/* Left side */}
						<div className="flex w-[45%] flex-col gap-5 text-sm text-[#404040]">
							<div className="flex items-center justify-between">
								<span>Order Number</span>
								<span className="font-bold text-black">#{orderNumber}</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Order Status</span>
								<span className="rounded-full bg-[#CEB604] px-3 py-1 text-xs font-semibold text-white">
									In progress
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Merchant Name</span>
								<span className="font-bold">{merchant.name}</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Next Installment Number</span>
								<span className="font-bold">
									{installments.find(installment => installment.status === "Scheduled")?.id || "N/A"}{" "}
									{/* Derive the next installment number */}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Next Installment Amount</span>
								<span className="font-bold">{formatCurrency(amount, true)}</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Next Installment Date</span>
								<span className={cn("font-bold", props.isOverdue ? "text-[#E55757]" : "text-black")}>
									{dayjs(props.date).isValid() ? dayjs(props.date).format("DD - MMMM - YYYY") : props.date}{" "}
								</span>
							</div>
						</div>

						<div className="w-[1px] bg-[#D9D9D9]" />

						<div
							className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 flex w-full flex-col gap-3 overflow-y-scroll text-[1.443rem]" // Increased font size by 15%
							style={{ maxHeight: "480px" }}
						>
							{installments.map((installment, index) => {
								const isExpanded = installment.id === expandedInstallment;
								const isFailed =
									installment.status.toLowerCase().includes("fail") ||
									installment.status.toLowerCase().includes("overdue");

								return (
									<div
										key={installment.id}
										className={cn(
											"flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 transition hover:bg-gray-100",
											isExpanded && "bg-white shadow-md", // Expanded styling with white background
										)}
										onClick={() => setExpandedInstallment(isExpanded ? null : installment.id)} // Toggle expansion
									>
										<div className="flex items-center gap-2">
											<div className={cn("h-5 w-5 rounded-full", isFailed ? "bg-[#E55757]" : "bg-[#C7E7A3]")} />{" "}
											{/* Increased size from h-4 w-4 to h-5 w-5 */}
											<span
												className={cn(
													"text-sm font-semibold",
													isFailed && "text-[#E55757]",
													isExpanded && "text-[22px] font-bold text-[#000000]",
												)}
											>
												Installment #{index + 1}
											</span>
										</div>
										<span
											className={cn(
												"text-sm",
												isFailed && "text-[#E55757]",
												isExpanded && "text-[22px] font-bold text-[#000000]", // Expanded font styling
											)}
										>
											{dayjs(installment.dueDate).isValid()
												? dayjs(installment.dueDate).format("DD - MMMM - YYYY")
												: installment.dueDate}{" "}
											{/* Ensure the exact date is displayed */}
										</span>
										<div
											className={cn(
												"flex items-center gap-1 text-sm font-semibold text-[#404040]",
												isExpanded && "text-[22px] font-bold text-[#000000]", // Expanded font styling
											)}
										>
											<Icon className="h-4 w-4" name="Riyal" />
											{formatCurrency(installment.amount, true)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				<div className="mt-8 flex w-full">{/* <InstallmentProgressBar installments={installments} /> */}</div>
			</DialogContent>
		</Dialog>
	);
};
