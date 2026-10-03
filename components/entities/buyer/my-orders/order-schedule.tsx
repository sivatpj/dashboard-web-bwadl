import dayjs from "dayjs";
import { Icon } from "@/components/global/icon";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface OrderScheduleProps {
	orderNumber: number;
	createdAt: string;
	shippingAt?: string | null;
	status: "In Progress" | "Delivery Confirmation" | "Cancelled" | "Completed";
	amount: number;
	outstanding: number;
	installment: number;
	installments: Array<{
		dueDate: string;
		status: "Paid" | "Payment Overdue" | "Paid / Late" | "Scheduled";
	}>;
	merchant: {
		name: string;
		logo?: string;
	};
	numberOfInstallments: number;
	paidInstallments: number;
	unpaidInstallments: number;
	lateInstallments: number;
	nextInstallmentDate?: string;
}

export const OrderSchedule = (props: OrderScheduleProps) => {
	const {
		status,
		merchant,
		orderNumber,
		amount,
		outstanding,
		installment,
		installments,
		numberOfInstallments,
		paidInstallments,
		unpaidInstallments,
		lateInstallments,
		nextInstallmentDate,
	} = props;

	const { style, icon } = {
		Cancelled: {
			icon: <Icon className="h-4 w-4" name="X" />,
			style: { backgroundColor: "#E55757", borderColor: "transparent", color: "#FFFFFF" },
		},
		Completed: {
			icon: <Icon className="h-4 w-4 font-bold" name="CompleteTick" />,
			style: { backgroundColor: "#C7E7A3", color: "#000000" },
		},
		"Delivery Confirmation": {
			icon: <Icon className="h-4 w-4" name="ClipboardCheckBlack" />,
			style: { backgroundColor: "#A6CAEC", borderColor: "transparent", color: "#000000" },
		},
		"In Progress": {
			icon: <Icon className="h-4 w-4" name="InProgressWhite" />,
			style: { backgroundColor: "#CEB604", borderColor: "#CEB604", color: "#FFFFFF" },
		},
	}[status];

	return (
		<div className="p-6">
			<div className="flex gap-8">
				<div className="flex flex-1 flex-col items-center justify-between gap-8">
					<div className="flex w-full flex-1 flex-col gap-8">
						{/* Upper Table */}
						<div className="flex flex-col gap-8">
							<div className="flex flex-col rounded-xl border bg-white text-[#404040]">
								<div className="flex min-h-[60px] items-center border-b px-4 py-3">
									<div className="flex-1 border-r pr-4">Order Number</div>
									<div className="flex-1 pl-4 font-bold">#{orderNumber}</div>
								</div>

								<div className="flex min-h-[60px] items-center border-b px-4 py-3">
									<div className="flex-1 border-r pr-4">Order Status</div>
									<div className="flex flex-1 items-center pl-4">
										<span
											className="flex h-8 items-center justify-between gap-4 rounded-full px-6 text-xs font-bold text-white"
											style={style}
										>
											{icon}
											<span>{status}</span>
										</span>
									</div>
								</div>

								<div className="flex min-h-[60px] items-center border-b px-4 py-3">
									<div className="flex-1 border-r pr-4">Merchant Name</div>
									<div className="flex-1 pl-4">
										<div className="flex items-center gap-x-2">
											<span className="font-bold">{merchant.name}</span>
											{!!merchant.logo && <img alt="logo" className="h-6 w-auto rounded-md" src={merchant.logo} />}
										</div>
									</div>
								</div>
							</div>

							{/* Lower Table */}
							<div className="flex flex-col rounded-xl border bg-white text-[#404040]">
								<div className="flex items-center justify-between border-b px-4 py-3">
									<div className="flex flex-1 flex-col">
										<span className="text-sm">Order Amount</span>
										<strong className="flex items-center gap-1 text-lg font-bold">
											<Icon className="h-4 w-4" name="Riyal" /> {formatCurrency(amount)}
										</strong>
									</div>

									<div className="mx-4 h-full border-l border-gray-300"></div>
									<div className="flex flex-1 flex-col">
										<span className="text-sm">Outstanding</span>
										<strong className="flex items-center gap-1 text-lg font-bold">
											<Icon className="h-4 w-4" name="Riyal" /> {formatCurrency(outstanding)}
										</strong>
									</div>
								</div>

								<div className="flex items-center justify-between border-b px-4 py-3">
									<div className="flex flex-1 flex-col">
										<span className="text-sm">Installment</span>
										<strong className="flex items-center gap-1 text-lg font-bold">
											<Icon className="h-4 w-4" name="Riyal" /> {formatCurrency(installment)}
										</strong>
									</div>

									<div className="mx-4 h-full border-l border-gray-300"></div>
									<div className="flex flex-1 flex-col">
										<span className="text-sm">Number of Installments</span>
										<strong className="text-lg font-bold">{numberOfInstallments}</strong>
									</div>
								</div>

								<div className="flex items-center justify-between border-b px-4 py-3">
									<div className="flex flex-1 flex-col">
										<span className="text-sm">Paid Installments</span>
										<strong className="text-lg font-bold">{paidInstallments}</strong>
									</div>

									<div className="mx-4 h-full border-l border-gray-300"></div>
									<div className="flex flex-1 flex-col">
										<span className="text-sm">Unpaid Installments</span>
										<strong className="text-lg font-bold">{unpaidInstallments}</strong>
									</div>
								</div>

								<div className="flex items-center justify-between px-4 py-3">
									<div className="flex flex-1 flex-col">
										<span className="text-sm">Late Payment Installments</span>
										<strong className="text-lg font-bold">{lateInstallments}</strong>
									</div>

									<div className="mx-4 h-full border-l border-gray-300"></div>
									<div className="flex flex-1 flex-col">
										<span className="text-sm">Next Installment</span>
										<strong className="text-lg font-bold">
											{nextInstallmentDate ? dayjs(nextInstallmentDate).format("DD - MMM - YYYY") : "-"}
										</strong>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-1 flex-col justify-between gap-8">
					<div className="h-[510px] overflow-y-auto rounded-xl border bg-white p-6">
						<div className="mb-6 text-[#404040]">
							<div className="flex items-center gap-6">
								<div className="flex flex-col items-center justify-center">
									<span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C7E7A3]" />
								</div>

								<div className="flex flex-1">
									<span className="font-bold text-[#404040]">Placing an order</span>
								</div>

								<div className="flex flex-1">
									<span>{dayjs(props.createdAt).format("DD - MMM - YYYY")}</span>
								</div>

								<div className="flex flex-1 items-center gap-2"></div>
							</div>
						</div>

						<div className="mb-6 text-[#404040]">
							<div className="flex items-center gap-6">
								<div className="flex flex-col items-center justify-center">
									<span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C7E7A3]" />
								</div>

								<div className="flex flex-1">
									<span className="font-bold text-[#404040]">Shipping item</span>
								</div>

								<div className="flex flex-1">
									<span>{props.shippingAt ? dayjs(props.shippingAt).format("DD - MMM - YYYY") : "-"}</span>
								</div>

								<div className="flex flex-1 items-center gap-2"></div>
							</div>
						</div>

						{/* Installments */}
						{installments.map((inst, index) => (
							<div key={index} className="mb-6 text-[#404040]">
								<div className="flex items-center gap-6">
									<div className="flex flex-col items-center justify-center">
										<span
											className={cn(
												"flex h-8 w-8 items-center justify-center rounded-full",
												inst.status === "Paid" && "bg-[#C7E7A3]",
												inst.status === "Payment Overdue" && "bg-[#E55757]",
												inst.status === "Scheduled" && "bg-[#E8E8E8]",
												inst.status === "Paid / Late" && "bg-[#FFE89F]",
											)}
										/>
									</div>
									<div className="flex flex-1">
										<span className="text-[#404040]">
											Installment <strong className="font-bold">#{index + 1}</strong>
										</span>
									</div>
									<div className="flex flex-1">
										<span>{dayjs(inst.dueDate).format("DD - MMM - YYYY")}</span>
									</div>
									<div className="flex flex-1 items-center gap-2">
										<Icon className="h-4 w-4" name="Riyal" />
										<span className="font-bold">{formatCurrency(installment)}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="mt-4 px-6">
				<div className="flex justify-start gap-2">
					{installments.map((inst, index) => {
						const getColor = () => {
							if (inst.status === "Paid") return "bg-[#C7E7A3]";
							if (inst.status === "Payment Overdue") return "bg-[#E55757]";
							if (inst.status === "Paid / Late") return "bg-[#FFE89F]";
							return "bg-[#E8E8E8]";
						};

						const additionalClasses =
							index === 0 ? "rounded-l-md" : index === installments.length - 1 ? "rounded-r-md" : "";

						return <div key={index} className={`h-10 w-8 ${getColor()} ${additionalClasses}`} />;
					})}
				</div>
			</div>
		</div>
	);
};
