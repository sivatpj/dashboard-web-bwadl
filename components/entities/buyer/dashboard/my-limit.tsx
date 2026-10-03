import { getRandomColor } from "hue-hash";
// import Link from "next/link";
import { useState } from "react";
import { ISalesOrder } from "@/api/types";
import { Icon } from "@/components/global/icon";
// import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

type SalesOrder = Pick<ISalesOrder, "id" | "reference" | "buyerId" | "amount">;

interface MyLimitProps {
	className?: string;
	salesOrders?: SalesOrder[];
	creditLimit?: number;
	availableLimit?: number;
	loading?: boolean;
	overdue?: number;
	onDelivery?: number;
	calcOutstanding?: number;
}

export const MyLimit = (props: MyLimitProps) => {
	const {
		className,
		salesOrders = [],
		creditLimit = 0,
		availableLimit = 0,
		overdue = 0,
		onDelivery = 0,
		calcOutstanding = 0,
	} = props;

	const { t } = useTranslationContext();
	const [hoveredOrder, setHoveredOrder] = useState<number | null>(null);

	return (
		<div className={cn("flex flex-1 flex-col gap-2 bg-white p-4", className)}>
			<div className="flex w-full items-center">
				<div
					className="overflow-hidden ltr:rounded-tl-md rtl:rounded-tr-md"
					style={{ flex: creditLimit - availableLimit }}
				>
					<div className="flex">
						<div
							className="h-8 bg-black"
							style={{ flex: creditLimit - availableLimit - overdue - onDelivery }}
						/>
						<div className="h-8 bg-[#3B82F6]" style={{ flex: onDelivery }} />
						<div className="h-8 bg-[#FF5C5B]" style={{ flex: overdue }} />
					</div>

					<div className="flex">
						{salesOrders.map(order => (
							<div
								key={`${order.id}-order-progress`}
								className="h-2 bg-black transition-all duration-300"
								onMouseEnter={() => setHoveredOrder(order.id)}
								onMouseLeave={() => setHoveredOrder(null)}
								style={{
									backgroundColor: getRandomColor(
										order.reference,
										hoveredOrder === order.id ? { lightness: { max: 60, min: 50 } } : undefined,
									),
									flex: order.amount,
								}}
							/>
						))}
					</div>
				</div>

				<div className="h-14 w-2.5 rounded-sm border-2 border-white bg-black" />

				<div className="h-10 bg-[#8C8C8C] ltr:rounded-tr-md rtl:rounded-tl-md" style={{ flex: availableLimit }} />
			</div>

			<div className="flex flex-1 gap-16 items-start">
				<div className="flex flex-col justify-around gap-4">
				

							<div className="flex items-center gap-4">
						<span className="inline-block h-14 w-4 bg-gray-400"></span>
						<div className="flex flex-col">
							<span className="text-sm text-gray-500">{t("admin.buyer.credit-limit")}</span>

							<div className="flex items-center gap-2 text-4xl font-bold">
								<Icon name="Riyal" />
								{formatCurrency(creditLimit, true)}
							</div>
						</div>
					</div>

					

				<div className="flex items-center gap-16">
						<div className="flex items-center gap-4">
							<span className="inline-block h-14 w-4 bg-black" />

							<div className="flex flex-col">
								<span className="text-sm text-gray-500">{t("admin.buyer.outstanding")}</span>

								<div className="flex items-center gap-2 text-4xl font-bold">
									<Icon name="Riyal" />
									{formatCurrency(calcOutstanding, true)}
								</div>
							</div>
						</div>

						<div className="flex items-center gap-4">
							<span className="inline-block h-14 w-4 bg-[#FF5C5B]"></span>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">{t("admin.buyer.overdue")}</span>

								<div className="flex items-center gap-2 text-4xl font-bold">
									<Icon name="Riyal" />
									{formatCurrency(overdue, true)}
								</div>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<span className="inline-block h-14 w-4 bg-[#3B82F6]"></span>
						<div className="flex flex-col">
							<span className="text-sm text-gray-500">{t("admin.buyer.on-delivery")}</span>

							<div className="flex items-center gap-2 text-4xl font-bold">
								<Icon name="Riyal" />
								{formatCurrency(onDelivery, true)}
							</div>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<span className="inline-block h-14 w-4 bg-gray-400"></span>
						<div className="flex flex-col">
							<span className="text-sm text-gray-500">{t("admin.buyer.available-limit")}</span>

							<div className="flex items-center gap-2 text-4xl font-bold">
								<Icon name="Riyal" />
								{formatCurrency(availableLimit, true)}
							</div>
						</div>
					</div>
				</div>

				{/* <div className="flex flex-col gap-2 w-full p-8">
					<span className="text-sm text-gray-500">{t("admin.buyers.sales-orders")}</span>
					<div className="grid auto-cols-max grid-flow-col gap-6 items-center">
						{salesOrders.map((order, index) => (
							<Link
								key={`${order.id}-order-details`}
								style={{ gridRow: (index % 2) + 1 }}
								href={config.PATHS.dashboard.ADMIN.salesOrder(order.id, order.buyerId)}
								className="hover:bg-gray-200 px-4 py-2 rounded-md"
								onMouseEnter={() => setHoveredOrder(order.id)}
								onMouseLeave={() => setHoveredOrder(null)}
							>
								<div className="flex items-center gap-4">
									<span
										className="inline-block h-10 w-3 transition-all duration-300"
										style={{
											backgroundColor: getRandomColor(
												order.reference,
												hoveredOrder === order.id ? { lightness: { max: 60, min: 50 } } : undefined,
											),
										}}
									/>

									<div className="flex flex-col">
										<span className="text-sm text-gray-500">#{order.reference}</span>
										<div className="flex items-center gap-2 text-2xl font-bold">
											<Icon name="Riyal" />
											{formatCurrency(order.amount, true)}
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div> */}
			</div>
		</div>
	);
};
