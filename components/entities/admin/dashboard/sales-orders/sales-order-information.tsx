import dayjs from "dayjs";
import {
	IBuyer,
	ICollection,
	ICollector,
	IFinancierOffer,
	IInsurer,
	IInvoice,
	ISalesOrder,
	ISupplier,
} from "@/api/types";
import { ConfirmDeliveryPopup } from "@/components/entities/admin/dashboard/sales-orders/confirm-delivery-popup";
import { DetailCard } from "@/components/global/detail-card";
import { Icon } from "@/components/global/icon";
import { useTranslationContext } from "@/contexts/translation";
import { formatCurrency } from "@/lib/format-currency";

type InvoiceWithRelations = IInvoice & {
	collections: ICollection[];
	buyer: IBuyer;
	supplier: ISupplier;
};

interface SalesOrderInformationProps extends ISalesOrder {
	buyer?: IBuyer;
	collector?: ICollector;
	insurer?: IInsurer;
	financierOffer?: IFinancierOffer;
	supplier?: ISupplier;
	invoices?: InvoiceWithRelations[];
}

const DELIVERY_STATUS_COLOR: Record<string, string> = {
	cancelled: "#D32F2F",
	"over-delivered": "#38A06C",
	delivered: "#38A06C",
	"partially-delivered": "#C97A1F",
	"not-delivered": "#D32F2F",
};

export const SalesOrderInformation = (props: SalesOrderInformationProps) => {
	const { reference, orderDate, invoices = [], amount, isCancelled, isClosed, buyer } = props;

	const existingInvoicesTotal = invoices.reduce((sum, inv) => sum + (inv.invoiceAmount ?? inv.deliveryAmount ?? 0), 0);
	const totalDeliveryAmount = invoices.reduce((sum, inv) => sum + (inv.deliveryAmount ?? 0), 0);

	const { t } = useTranslationContext();

	const orderInitial = reference?.trim()?.charAt(0)?.toUpperCase() || "S";

	const paidAmount = invoices.reduce(
		(sum, inv) => sum + (inv.calcCollection || (inv as any).calcPaidAmount || 0),
		0,
	);
	const overdueAmount = invoices.reduce((sum, inv) => sum + (inv.calcOverdue || 0), 0);
	const outstandingAmount = Math.max(existingInvoicesTotal - paidAmount, 0);

	const deliveryStatusKey = props.deliveryStatus ?? (isCancelled ? "cancelled" : "not-delivered");
	const deliveryStatus = {
		label:
			deliveryStatusKey === "cancelled"
				? t("admin.sales-orders.status-cancelled")
				: t(`admin.sales-orders.${deliveryStatusKey}`),
		color: DELIVERY_STATUS_COLOR[deliveryStatusKey] ?? "#D32F2F",
	};

	return (
		<div className="rounded-[12px] bg-[#EAF4FB] px-6 py-5">
			<div className="flex flex-col gap-5">
				{/* Header row */}
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-4">
						<div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#404040] text-[24px] font-bold text-white">
							{orderInitial}
						</div>

						<div className="flex flex-col gap-2">
							<div className="flex flex-wrap items-center gap-3">
								<h2 className="text-[22px] font-bold leading-none text-[#404040]">{reference || "-"}</h2>
								<span
									className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-1 text-[14px] font-semibold"
									style={{ color: deliveryStatus.color }}
								>
									<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: deliveryStatus.color }} />
									{deliveryStatus.label}
								</span>
								{buyer?.facilityName && (
									<span className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-1 text-[14px] font-bold text-[#404040]">
										<Icon className="h-4 w-4 shrink-0 fill-[#404040]" name="Buyer" />
										{buyer.facilityName}
									</span>
								)}
							</div>

							<div className="flex flex-wrap items-center gap-2 text-[14px] text-[#4A4A4A]">
								<span>
									{t("admin.sales-orders.sales-order-date")}{" "}
									<span className="font-bold">{orderDate ? dayjs(orderDate).format("DD MMM YYYY") : "-"}</span>
								</span>
							</div>
						</div>
					</div>

					{!isCancelled && !isClosed && (
						<div className="flex items-start gap-3">
							<ConfirmDeliveryPopup salesOrder={props} />
						</div>
					)}
				</div>

				{/* Summary cards */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
					<DetailCard
						className="xl:w-full"
						label={t("admin.sales-orders.sales-order-amount")}
						value={
							<span className="inline-flex items-center gap-2">
								<Icon className="h-5 w-5" name="Riyal" />
								<span>{formatCurrency(amount, true) || "0.00"}</span>
							</span>
						}
					/>
					{/* <DetailCard
						className="xl:w-full"
						label={t("admin.sales-orders.delivery-amount")}
						value={
							<span className="inline-flex items-center gap-2">
								<Icon className="h-5 w-5" name="Riyal" />
								<span>{formatCurrency(totalDeliveryAmount, true) || "0.00"}</span>
							</span>
						}
					/> */}
					<DetailCard
						className="xl:w-full"
						label={t("admin.sales-orders.number-of-invoices")}
						value={<span>{String(invoices.length)}</span>}
					/>
					<DetailCard
						className="xl:w-full"
						label={t("admin.sales-orders.paid-amount")}
						value={
							<span className="inline-flex items-center gap-2">
								<Icon className="h-5 w-5" name="Riyal" />
								<span>{formatCurrency(paidAmount, true) || "0.00"}</span>
							</span>
						}
					/>
						<DetailCard
						className="xl:w-full"
						label={t("admin.sales-orders.outstanding")}
						value={
							<span className="inline-flex items-center gap-2">
								<Icon className="h-5 w-5" name="Riyal" />
								<span>{formatCurrency(outstandingAmount, true) || "0.00"}</span>
							</span>
						}
					/>

					{/* Not Delivered: no invoices yet; Completed: invoiced amount covers full order amount; otherwise Ongoing */}
					{/* <DetailCard
						className="xl:w-full"
						label={t("admin.sales-orders.status")}
						value={
							!hasDelivery ? (
								<span className="inline-flex items-center gap-2 text-[#D32F2F]">
									<span className="h-2.5 w-2.5 rounded-full bg-[#D32F2F]" />
									{t("admin.sales-orders.not-delivered")}
								</span>
							) : isCompleted ? (
								<span className="inline-flex items-center gap-2 text-[#38A06C]">
									<span className="h-2.5 w-2.5 rounded-full bg-[#38A06C]" />
									{t("admin.common.invoice-status-enum.Completed")}
								</span>
							) : (
								<span className="inline-flex items-center gap-2 text-[#C97A1F]">
									<span className="h-2.5 w-2.5 rounded-full bg-[#C97A1F]" />
									{t("admin.common.invoice-status-enum.Ongoing")}
								</span>
							)
						}
					/> */}

					<DetailCard
						className="xl:w-full"
						label={t("admin.sales-orders.total-overdue-amount")}
						value={
							overdueAmount > 0 ? (
								<span className="inline-flex items-center gap-2 text-[#D32F2F]">
									<span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D32F2F] text-[10px] text-white">
										!
									</span>
									<span>{formatCurrency(overdueAmount, true)}</span>
								</span>
							) : (
								<span className="inline-flex items-center gap-2">
									<Icon className="h-5 w-5" name="Riyal" />
									<span>0.00</span>
								</span>
							)
						}
					/>
				</div>
			</div>
		</div>
	);
};
