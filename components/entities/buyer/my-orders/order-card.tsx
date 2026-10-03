import { Separator } from "@radix-ui/react-separator";
import dayjs from "dayjs"; // Adjust the import path
import { Icon } from "@/components/global/icon";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { OrderSchedule } from "./order-schedule";

interface OrderCardProps {
	createdAt: string;
	shippingAt?: string | null;
	orderNumber: number;
	status: "In Progress" | "Delivery Confirmation" | "Cancelled" | "Completed";
	amount: number;
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

const orders: OrderCardProps[] = [
	{
		amount: 4800,
		createdAt: "2025-04-01",
		installments: Array.from({ length: 3 }, (_, idx) => ({
			dueDate: `2025-04-${10 + idx * 5}`,
			status: idx === 0 ? "Paid" : "Scheduled",
		})),
		lateInstallments: 0,
		merchant: { name: "Jazeera Electronics" },
		nextInstallmentDate: "2025-04-15",
		numberOfInstallments: 3,
		orderNumber: 106001,
		paidInstallments: 1,
		shippingAt: "2025-04-05",
		status: "In Progress",
		unpaidInstallments: 1,
	},
	{
		amount: 6200,
		createdAt: "2025-04-01",
		installments: Array.from({ length: 4 }, (_, idx) => ({
			dueDate: `2025-04-${15 + idx * 5}`,
			status: idx === 0 ? "Paid" : idx === 1 ? "Paid / Late" : idx === 2 ? "Payment Overdue" : "Scheduled",
		})),
		lateInstallments: 1,
		merchant: { name: "Extra Bahrain" },
		nextInstallmentDate: "2025-05-10",
		numberOfInstallments: 4,
		orderNumber: 106002,
		paidInstallments: 2,
		shippingAt: "2025-04-07",
		status: "Delivery Confirmation",
		unpaidInstallments: 1,
	},
	{
		amount: 6200,
		createdAt: "2025-04-01",
		installments: Array.from({ length: 10 }, (_, idx) => ({
			dueDate: `2025-06-${String((idx % 30) + 1).padStart(2, "0")}`,
			status: idx === 0 ? "Paid" : idx === 1 ? "Paid / Late" : idx === 2 ? "Payment Overdue" : "Scheduled",
		})),
		lateInstallments: 1,
		merchant: { name: "Extra Bahrain" },
		nextInstallmentDate: "2025-07-10",
		numberOfInstallments: 10,
		orderNumber: 106003,
		paidInstallments: 2,
		shippingAt: "2025-04-07",
		status: "Cancelled",
		unpaidInstallments: 5,
	},
];

export const OrderCard = () => {
	return (
		<div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 h-[500px] overflow-y-scroll">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
				{[...orders, ...orders.slice(0, 3)].map(order => (
					<SingleOrderCard key={`${order.orderNumber}-${Math.random()}`} {...order} />
				))}
			</div>
		</div>
	);
};

const SingleOrderCard = (props: OrderCardProps) => {
	const {
		status,
		amount,
		orderNumber,
		installments,
		numberOfInstallments,
		paidInstallments,
		unpaidInstallments,
		lateInstallments,
		nextInstallmentDate,
	} = props;

	const installment = amount / installments.length;
	const outstanding =
		amount -
		installments.filter(installment => ["Paid", "Paid / Late"].includes(installment.status)).length * installment;

	const style = {
		Cancelled: { backgroundColor: "#E55757", borderColor: "transparent", color: "#FFFFFF" },
		Completed: { backgroundColor: "#C7E7A3", color: "#000000" },
		"Delivery Confirmation": { backgroundColor: "#A6CAEC", borderColor: "transparent", color: "#000000" },
		"In Progress": { backgroundColor: "#CEB604", borderColor: "#CEB604", color: "#FFFFFF" },
	}[status];

	return (
		<Card className="rounded-md border border-[#E6E6E6] bg-white shadow-sm transition-all hover:shadow-md">
			<div className="flex w-full items-center justify-between rounded-t-md bg-[#D9D9D9] px-4 py-2">
				<span className="text-lg font-semibold">#{orderNumber}</span>
				<div
					className="flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
					style={style}
				>
					{status === "In Progress" && <Icon className="h-4 w-4" name="InProgressWhite" />}
					{status === "Delivery Confirmation" && <Icon className="h-4 w-4" name="ClipboardCheckBlack" />}
					{status === "Cancelled" && <Icon className="h-4 w-4" name="X" />}
					{status === "Completed" && <Icon className="h-4 w-4" name="Completed" />}

					<span>{status}</span>
				</div>
			</div>

			<CardContent className="flex flex-col gap-4 px-4 py-4">
				<div className="flex justify-between gap-4">
					<div className="flex flex-1 flex-col gap-1">
						<span className="text-sm text-gray-500">Order amount</span>
						<div className="flex items-center gap-2 text-lg font-semibold text-[#141919]">
							<Icon name="Riyal" />
							{amount}
						</div>
					</div>

					<Separator className="h-auto w-[1px] bg-[#E0E0E0]" orientation="vertical" />

					<div className="flex flex-1 flex-col gap-1">
						<span className="text-sm text-gray-500">Outstanding</span>
						<div className="flex items-center gap-2 text-lg font-semibold text-[#141919]">
							<Icon name="Riyal" />
							{outstanding}
						</div>
					</div>
				</div>

				<Separator className="h-[1px] w-full bg-[#E0E0E0]" />

				<div className="flex justify-between gap-4">
					<div className="flex flex-1 flex-col gap-1">
						<span className="text-sm text-gray-500">Installment</span>
						<div className="flex items-center gap-2 text-lg font-semibold text-[#141919]">
							<Icon className="h-4 w-4" name="Riyal" />
							{installment}
						</div>
					</div>

					<div className="w-[1px] bg-[#E0E0E0]" />

					<div className="flex flex-1 flex-col gap-1">
						<span className="text-sm text-gray-500">Number of installments</span>
						<span className="text-lg font-semibold text-[#141919]">{numberOfInstallments}</span>
					</div>
				</div>

				<Separator className="h-[1px] w-full bg-[#E0E0E0]" />

				<div className="flex justify-between gap-4">
					<div className="flex flex-1 flex-col gap-1">
						<span className="text-sm text-gray-500">Paid installments</span>
						<span className="text-lg font-semibold text-[#141919]">{paidInstallments}</span>
					</div>

					<div className="w-[1px] bg-[#E0E0E0]" />

					<div className="flex flex-1 flex-col gap-1">
						<span className="text-sm text-gray-500">Unpaid installments</span>
						<span className="text-lg font-semibold text-[#141919]">{unpaidInstallments}</span>
					</div>
				</div>

				<Separator className="h-[1px] w-full bg-[#E0E0E0]" />

				<div className="flex justify-between gap-4">
					<div className="flex flex-1 flex-col gap-1">
						<span className="text-sm text-gray-500">Late paym. installments</span>
						<span className="text-lg font-semibold text-[#141919]">{lateInstallments}</span>
					</div>

					<div className="w-[1px] bg-[#E0E0E0]" />

					<div className="flex flex-1 flex-col gap-1">
						<span className="text-sm text-gray-500">Next installments</span>
						<span className="text-lg font-semibold text-[#141919]">
							{nextInstallmentDate ? dayjs(nextInstallmentDate).format("YYYY-MM-DD") : "-"}
						</span>
					</div>
				</div>

				<Separator className="h-[1px] w-full bg-[#E0E0E0]" />

				<div className="mt-2 flex gap-[2px] overflow-hidden rounded-md">
					{installments.map((i, idx) => {
						const color =
							i.status === "Paid" || i.status === "Paid / Late"
								? "#C7E7A3"
								: i.status === "Payment Overdue"
									? "#E55757"
									: "#D9D9D9";

						return (
							<div
								key={idx}
								className="h-2 flex-1 rounded-full"
								style={{
									backgroundColor: color,
								}}
							/>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};
