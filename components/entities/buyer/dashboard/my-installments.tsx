// import { IInstallment } from "@/api/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { config } from "@/constants/config";
import { formatCurrency } from "@/lib/format-currency";
import { getNumberOrdinal } from "@/lib/get-number-ordinal";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

interface MyInstallmentsProps {
	className?: string;
	installments?: any[];
	loading?: boolean;
}

export const MyInstallments = (props: MyInstallmentsProps) => {
	const { className, installments = [], loading } = props;

	return (
		<Card className={cn("flex flex-1 flex-col gap-2 p-6", className)}>
			<div className="flex justify-between">
				<h2 className="text-lg font-semibold">My Installments</h2>

				<Link
					className="flex items-center gap-2 text-sm hover:underline"
					href={`${config.PATHS.dashboard.BUYER.myOrders}?tab=INSTALLMENTS`}
				>
					View All
					<Icon className="h-4 w-4" name="CircleArrowRight" />
				</Link>
			</div>

			<div className="overflow-hidden rounded-t-lg border">
				<table className="w-full border-collapse text-sm">
					<thead className="bg-gray-300">
						<tr className="text-s bg-[#D9D9D9] text-left font-semibold">
							<th className="rounded-tl-md p-2 text-left"></th>
							<th className="p-2 text-left">Order Number</th>
							<th className="p-2 text-left">Due Date</th>
							<th className="p-2 text-left">Amount</th>
							<th className="p-2 text-left">Due In</th>
							<th className="rounded-tr-md p-2 text-left">Status</th>
						</tr>
					</thead>

					<tbody>
						{installments.slice(0, 4).map(installment => {
							const date = dayjs(installment.installment_due_date);
							const dueIn = date.fromNow(true).split(" ");
							const isOverdue = date.isBefore(dayjs());

							return (
								<tr key={installment.id} className="border-b">
									<td className="p-2">{isOverdue && <Icon className="h-4 w-4 text-[#E55757]" name="Warning" />}</td>

									<td className={cn("p-2 font-bold", isOverdue && "font-bold text-[#E55757]")}>
										#{installment.order_number}
									</td>

									<td className={cn("p-2 font-bold", isOverdue && "text-[#E55757]")}>
										<span className="font-bold">
											{date.format("D")}
											<sup className="text-[10px]">{getNumberOrdinal(date.date())}</sup>
											{date.format(" MMM YYYY")}
										</span>
									</td>

									<td className={cn("p-2 font-bold", isOverdue && "text-[#E55757]")}>
										<div className="flex items-center gap-2">
											<Icon className={cn(isOverdue && "fill-[#E55757]")} name="Riyal" />{" "}
											{formatCurrency(installment.installment_amount)}
										</div>
									</td>

									<td className={cn("p-2", isOverdue && "text-[#E55757]")}>
										{!isNaN(+dueIn[0]) ? (
											<span>
												<strong>{dueIn[0]}</strong> {dueIn[1]}
											</span>
										) : (
											`${dueIn[0]} ${dueIn[1]}`
										)}
										{isOverdue ? " (-)" : ""}
									</td>

									<td className="p-2">
										<Button
											className={cn("h-6 rounded-full", !isOverdue ? "border-black" : "bg-[#E55757] text-white")}
											variant={isOverdue ? "default" : "outline"}
										>
											{isOverdue ? "Payment Overdue" : "Schedule"}
										</Button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</Card>
	);
};
