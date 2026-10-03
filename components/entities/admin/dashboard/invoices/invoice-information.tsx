import dayjs from "dayjs";
import type { ReactNode } from "react";
import {
	IBuyer,
	ICollection,
	ICollector,
	IFinancierOffer,
	IFinancierSupplierContract,
	IInsurer,
	IInvoice,
	ISupplier,
} from "@/api/types";
import { AddNewPayment } from "@/components/entities/admin/dashboard/invoices/add-invoice-level-payment";
import { DetailCard } from "@/components/global/detail-card";
import { Icon } from "@/components/global/icon";
import { useTranslationContext } from "@/contexts/translation";
import { formatCurrency } from "@/lib/format-currency";
import { getCollectionStatus } from "@/lib/get-collection-status";

interface InvoiceInformationProps extends IInvoice {
	reference?: string;
	buyer?: IBuyer;
	supplier: ISupplier;
	collections: ICollection[];
	insurer: IInsurer;
	collector: ICollector;
	financierOffer: IFinancierOffer;
	financierSupplierContract: IFinancierSupplierContract;
	action?: ReactNode;
}

const collectionSquareColors: Record<string, string> = {
	Paid: "#38A06C",
	"Partially Paid": "#1976D2",
	Ongoing: "#D9D9D9",
	Overdue: "#E55757",
	Unknown: "#D9D9D9",
};

export const InvoiceInformation = (props: InvoiceInformationProps) => {
	const {
		id,
		collections,
		createdAt,
		deliveryAmount,
		deliveryDate,
		invoiceAmount,
		invoiceReference,
		reference,
		isCancelled,
		status,
		action,
		financierOffer,
		calcPaidAmount,
		calcPaid,
		calcOverdue,
		buyer,
	} = props;

	const { t } = useTranslationContext();

	const invoiceInitial = invoiceReference?.trim()?.charAt(0)?.toUpperCase() || "I";
	const displayReference = invoiceReference || reference || "-";

	const currentCollections = collections.filter(c => c.isCurrent);

	const allPaid = currentCollections.length > 0 && currentCollections.every(col => getCollectionStatus(col) === "Paid");

	const paidInstallments = currentCollections.filter(col => getCollectionStatus(col) === "Paid").length;
	const totalInstallments = currentCollections.length;

	const collectionsPaid = currentCollections
		.filter(col => ["Paid", "Partially Paid"].includes(getCollectionStatus(col)))
		.reduce((sum, col) => sum + (col.appliedAmount || 0), 0);
	const totalPaid = currentCollections.length ? collectionsPaid : Number(calcPaidAmount || calcPaid || 0);
	const totalOverdue = currentCollections.length
		? currentCollections
				.filter(col => {
					const remaining = Number(col.remainingAmount || 0);
					return remaining > 0 && dayjs(col.eligibleAt).isBefore(dayjs(), "day");
				})
				.reduce((sum, col) => sum + Number(col.remainingAmount || 0), 0)
		: Number(calcOverdue || 0);
	const baseAmount = deliveryAmount || invoiceAmount || 0;
	const remainingAmount = (props as any).calcOutstanding;
	const isSettled = baseAmount > 0 && remainingAmount <= 0;
	const isPendingDelivery = status === "Confirm Delivery" || (!isCancelled && (!deliveryAmount || !deliveryDate));

	// Completed is derived from the actual paid/outstanding amounts (the backend can lag behind
	// this), but Overdue vs. Ongoing has no local signal, so that distinction is trusted from the backend.
	const isOverdue = !isSettled && status === "Overdue";

	return (
		<div className="rounded-[12px] bg-[#EAF4FB] px-6 py-5">
			<div className="flex flex-col gap-5">
				{/* Header row */}
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-4">
						<div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#404040] text-[24px] font-bold text-white">
							{invoiceInitial}
						</div>

						<div className="flex flex-col gap-2">
							<div className="flex flex-wrap items-center gap-3">
								<h2 className="text-[22px] font-bold leading-none text-[#404040]">
									{displayReference} <span className="text-[16px] font-normal text-[#808080]">#{id}</span>
								</h2>
								{isPendingDelivery ? (
									<span className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-1 text-[14px] font-semibold text-[#D32F2F]">
										<span className="h-2.5 w-2.5 rounded-full bg-[#D32F2F]" />
										{t("admin.sales-orders.confirm-delivery")}
									</span>
								) : isSettled || allPaid ? (
									<span className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-1 text-[14px] font-semibold text-[#38A06C]">
										<span className="h-2.5 w-2.5 rounded-full bg-[#38A06C]" />
										{t("admin.common.invoice-status-enum.Completed")}
									</span>
								) : isOverdue ? (
									<span className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-1 text-[14px] font-semibold text-[#D32F2F]">
										<span className="h-2.5 w-2.5 rounded-full bg-[#D32F2F]" />
										{t("admin.common.invoice-status-enum.Overdue")}
									</span>
								) : (
									<span className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-1 text-[14px] font-semibold text-[#C97A1F]">
										<span className="h-2.5 w-2.5 rounded-full bg-[#C97A1F]" />
										{t("admin.common.invoice-status-enum.Ongoing")}
									</span>
								)}
								{buyer?.facilityName && (
									<span className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-1 text-[14px] font-bold text-[#404040]">
										<Icon className="h-4 w-4 shrink-0 fill-[#404040]" name="Buyer" />
										{buyer.facilityName}
									</span>
								)}
							</div>

							<div className="flex flex-wrap items-center gap-2 text-[14px] text-[#4A4A4A]">
								<span>
									{t("admin.invoices.invoice-date")}{" "}
									<span className="font-bold">{createdAt ? dayjs(createdAt).format("DD MMM, YYYY") : "-"}</span>
								</span>
								<span className="text-[#808080]">•</span>
								<span>
									{t("admin.invoices.delivery-date")}{" "}
									<span className="font-bold">{deliveryDate ? dayjs(deliveryDate).format("DD MMM, YYYY") : "-"}</span>
								</span>
							</div>
						</div>
					</div>
					{action ?? (!isPendingDelivery && !financierOffer?.isPreDeliveryOnly && <AddNewPayment {...props} />)}
				</div>

				{/* Summary cards */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
					<DetailCard
						className="xl:w-full"
						label={t("admin.invoices.invoice-amount")}
						value={
							<span className="inline-flex items-center gap-2">
								<Icon className="h-5 w-5" name="Riyal" />
								<span>{formatCurrency(baseAmount, true) || "0.00"}</span>
							</span>
						}
					/>
					<DetailCard
						className="xl:w-full"
						label={`${t("admin.invoices.paid-amount")} (${paidInstallments}/${totalInstallments})`}
						value={
							<span className="inline-flex items-center gap-2">
								<Icon className="h-5 w-5" name="Riyal" />
								<span>{formatCurrency(totalPaid, true) || "0.00"}</span>
							</span>
						}
					/>
					<DetailCard
						className="xl:w-full"
						label={`${t("admin.invoices.remaining-amount")} (${totalInstallments - paidInstallments}/${totalInstallments})`}
						value={
							<span className="inline-flex items-center gap-2">
								<Icon className="h-5 w-5" name="Riyal" />
								<span>{formatCurrency(remainingAmount, true) || "0.00"}</span>
							</span>
						}
					/>
					<DetailCard
						className="xl:w-full"
						label={t("admin.invoices.total-overdue-amount")}
						value={
							<span className="inline-flex items-center gap-2">
								<Icon className="h-5 w-5" name="Riyal" />
								<span>{formatCurrency(totalOverdue, true) || "0.00"}</span>
							</span>
						}
					/>
				</div>

				{/* Collection status squares */}
				{collections.length > 0 && (
					<div className="flex flex-wrap items-center gap-1.5">
						{collections
							.filter(c => c.isCurrent)
							.map((col, idx) => {
								const colStatus = getCollectionStatus(col);
								const squareStatus = isPendingDelivery ? t("admin.sales-orders.confirm-delivery") : colStatus;
								const squareColor = isPendingDelivery ? "#D9D9D9" : collectionSquareColors[colStatus] || "#D9D9D9";
								return (
									<div
										key={col.id}
										className="flex h-[42px] w-[40px] items-center justify-center rounded-[3px] text-[11px] font-semibold text-white"
										style={{ backgroundColor: squareColor }}
										title={squareStatus}
									>
										{idx + 1}
									</div>
								);
							})}
					</div>
				)}
			</div>
		</div>
	);
};
