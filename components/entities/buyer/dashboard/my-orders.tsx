import Link from "next/link";
import { Icon } from "@/components/global/icon";
import { Card, CardContent } from "@/components/ui/card";
import { InstallmentProgressBar } from "@/components/ui/InstallmentProgressBar";
// import { IOrder } from "@/api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { config } from "@/constants/config";
import { generateOrder } from "@/lib/fake-data/generateOrder";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface MyOrdersProps {
	className?: string;
	orders?: any[];
	loading?: boolean;
}

export const MyOrders = (props: MyOrdersProps) => {
	const { className, orders = [], loading } = props;

	return (
		<div className={cn("flex flex-1 flex-col gap-4 rounded-xl bg-white p-4 shadow-md", className)}>
			<div className="flex flex-row items-center justify-between">
				<h2 className="text-lg font-bold">My Orders</h2>

				<Link className="flex items-center gap-2 text-sm" href={`${config.PATHS.dashboard.BUYER.myOrders}?tab=ORDERS`}>
					<span>View All</span>
					<Icon className="h-4 w-4" name="CircleArrowRight" />
				</Link>
			</div>

			{/* <div className="flex flex-1 flex-col gap-3">
				{loading
					? Array.from({ length: 3 }).map((_, index) => (
							<Skeleton key={`loading-order-${index}`} className="h-60 w-full rounded-b-none" />
						))
					: orders.slice(0, 3).map((order, index) => {
							const { style, icon } = {
								"In Progress": {
									style: { backgroundColor: "#CC9B00", color: "white", borderColor: "#CC9B00" },
									icon: <Icon className="h-4 w-4" name="InProgressWhite" />,
								},
								"Delivery Confirmation": {
									icon: <Icon className="h-4 w-4" name="ClipboardCheckBlack" />,
									style: { backgroundColor: "#A6CAEC", color: "black", borderColor: "transparent" },
								},
								Cancelled: {
									icon: <Icon className="h-4 w-4" name="X" />,
									style: { backgroundColor: "#E55757", color: "white", borderColor: "transparent" },
								},
								Completed: {
									style: { backgroundColor: "#C7E7A3", color: "#000" },
									icon: <Icon className="h-4 w-4 font-bold" name="CompleteTick" />,
								},
							}[order.order_status || "In Progress"];

							const installmentAmount = order.order_amount / Number(order.installmentNumber);
							const remainingAmount = order.order_amount - order.total_paid_amount;

							return (
								<Card key={index} className="flex flex-col rounded-b-none rounded-t-lg">
									<div className="flex items-center justify-between rounded-t-lg bg-[#D9D9D9] px-4 py-2">
										<span className="text-lg font-bold">#{order.id}</span>
										<span className="flex h-6 items-center gap-2 rounded-full border px-3 py-1 text-sm" style={style}>
											{icon} {order.order_status}
										</span>
									</div>

									<CardContent className="flex w-full flex-1 flex-col gap-4 py-2">
										<div className="flex flex-1 flex-col gap-2">
											<div className="flex w-full flex-1">
												<div className="flex flex-1 flex-col items-start">
													<span className="text-sm">Order amount:</span>
													<strong className="flex items-center gap-1">
														<Icon name="Riyal" /> {formatCurrency(order.order_amount)}
													</strong>
												</div>

												<div className="mx-4 w-px bg-gray-300" />

												<div className="flex flex-1 flex-col items-start">
													<span className="text-sm">Outstanding:</span>
													<strong className="flex items-center gap-1">
														<Icon name="Riyal" /> {formatCurrency(remainingAmount)}
													</strong>
												</div>
											</div>

											<div className="my-2 border-t border-gray-300" />

											<div className="flex w-full flex-1">
												<div className="flex flex-1 flex-col items-start">
													<span className="text-sm">Installment:</span>
													<strong className="flex items-center gap-1">
														<Icon name="Riyal" /> {formatCurrency(installmentAmount)}
													</strong>
												</div>

												<div className="mx-4 w-px bg-gray-300" />

												<div className="flex flex-1 flex-col items-start">
													<span className="text-sm">Number of Installments:</span>
													<strong className="flex items-center gap-1">{order.installmentNumber}</strong>
												</div>
											</div>
										</div>

										<InstallmentProgressBar
											installmentsPaid={Number(order.installments_paid)}
											installmentsUnpaid={Number(order.installments_unpaid)}
											latePaid={Number(order.late_paid)}
										/>
									</CardContent>
								</Card>
							);
						})}
			</div> */}
		</div>
	);
};
