import dayjs from "dayjs";
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
import { Icon } from "@/components/global/icon";
import { useTranslationContext } from "@/contexts/translation";
import { formatCurrency } from "@/lib/format-currency";
import { getCollectionStatus } from "@/lib/get-collection-status";
import { InvoiceStatusPill } from "./invoice-status-pill";

interface InvoiceDetailsFormProps extends IInvoice {
	buyer: IBuyer;
	supplier: ISupplier;
	collections: ICollection[];
	insurer: IInsurer;
	collector: ICollector;
	financierOffer: IFinancierOffer;
	financierSupplierContract: IFinancierSupplierContract & {
		financier?: { financierName?: string; facilityName?: string };
	};
	salesOrderReference?: string;
}

const RiyalAmount = ({ value }: { value: string }) => (
	<span className="inline-flex items-center gap-1">
		<Icon className="h-3.5 w-3.5" name="Riyal" />
		{value}
	</span>
);

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
	<div className="flex items-center justify-between py-2">
		<span className="text-[14px] text-[#5F6870]">{label}</span>
		<span className="text-[14px] font-semibold text-[#404040]">{value}</span>
	</div>
);

export const InvoiceDetailsForm = (props: InvoiceDetailsFormProps) => {
	const {
		collections,
		createdAt,
		deliveryAmount,
		deliveryDate,
		buyer,
		supplier,
		insurer,
		collector,
		isCancelled,
		invoiceAmount,
		invoiceReference,
		status,
		salesOrderReference,
		isFinal,
	} = props;

	const { t } = useTranslationContext();

	const currentCollections = collections.filter(c => c.isCurrent);
	const totalInstallments = currentCollections.length;
	const totalPaid = currentCollections
		.filter(col => ["Paid", "Partially Paid"].includes(getCollectionStatus(col)))
		.reduce((sum, col) => sum + (col.appliedAmount || 0), 0);
	const totalOverdue = currentCollections
		.filter(col => {
			const remaining = Number(col.remainingAmount || 0);
			return remaining > 0 && dayjs(col.eligibleAt).isBefore(dayjs(), "day");
		})
		.reduce((sum, col) => sum + Number(col.remainingAmount || 0), 0);
	const baseAmount = deliveryAmount || invoiceAmount || 0;
	const remainingAmount = (props as any).calcOutstanding;
	const allPaid = currentCollections.length > 0 && currentCollections.every(col => getCollectionStatus(col) === "Paid");
	const isSettled = baseAmount > 0 && remainingAmount <= 0;
	const isPendingDelivery = status === "Confirm Delivery";
	// Completed is derived from the actual paid/outstanding amounts (the backend can lag behind
	// this), but Overdue vs. Ongoing has no local signal, so that distinction is trusted from the backend.
	const displayStatus = isPendingDelivery
		? "Confirm Delivery"
		: isSettled || allPaid
			? "Completed"
			: isCancelled || status === "Cancelled"
				? "Cancelled"
				: status || "Ongoing";
	const cancelledLabel = isCancelled ? t("admin.invoices.yes") : t("admin.invoices.no");

	const installmentDates = currentCollections.map(col => col.eligibleAt).filter(Boolean);
	const invoiceStartDate = installmentDates.length > 0 ? installmentDates.reduce((a, b) => (a < b ? a : b)) : null;
	const invoiceEndDate = installmentDates.length > 0 ? installmentDates.reduce((a, b) => (a > b ? a : b)) : null;

	return (
		<div className="flex flex-col gap-2">
			{/* <label className="font-bold">{t("admin.invoices.invoice-details")}</label> */}

			<div className="grid grid-cols-2 gap-4">
				<div className="flex overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<div className="flex-1 p-5">
						<h3 className="mb-4 text-[16px] font-bold text-[#404040]">{t("admin.invoices.invoice-details")}</h3>
						<div className="flex flex-col divide-y divide-[#F0F0F0]">
							{salesOrderReference && (
								<DetailRow label={t("admin.invoices.sales-order-number")} value={salesOrderReference} />
							)}
							<DetailRow label={t("admin.invoices.invoice-number")} value={invoiceReference || "-"} />
							
							<DetailRow
								label={t("admin.invoices.delivery-date")}
								value={deliveryDate ? dayjs(deliveryDate).format("DD MMM, YYYY") : "-"}
							/>
							<DetailRow
								label={t("admin.invoices.delivery-amount")}
								value={<RiyalAmount value={formatCurrency(deliveryAmount, true)} />}
							/>
							<DetailRow
								label={t("admin.invoices.paid-amount")}
								value={<RiyalAmount value={formatCurrency(totalPaid, true)} />}
							/>
							<DetailRow
								label={t("admin.invoices.remaining-amount")}
								value={<RiyalAmount value={formatCurrency(remainingAmount, true)} />}
							/>
							<DetailRow label={t("admin.invoices.status")} value={<InvoiceStatusPill status={displayStatus} />} />
							<DetailRow
								label={t("admin.invoices.final-invoice")}
								value={isFinal ? t("admin.invoices.yes") : t("admin.invoices.no")}
							/>

							<DetailRow label={t("admin.invoices.installments")} value={totalInstallments} />
							<DetailRow
								label={t("admin.invoices.first-installment-date")}
								value={invoiceStartDate ? dayjs(invoiceStartDate).format("DD MMM, YYYY") : "-"}
							/>
							<DetailRow
								label={t("admin.invoices.last-installment-date")}
								value={invoiceEndDate ? dayjs(invoiceEndDate).format("DD MMM, YYYY") : "-"}
							/>
							<DetailRow
								label={t("admin.invoices.overdue-amount")}
								value={<RiyalAmount value={formatCurrency(totalOverdue, true)} />}
							/>
						</div>
					</div>
				</div>

				<div className="flex overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<div className="flex-1 p-5">
						<h3 className="mb-4 text-[16px] font-bold text-[#404040]">{t("admin.invoices.other-details")}</h3>
						<div className="flex flex-col divide-y divide-[#F0F0F0]">
							<DetailRow label={t("admin.buyers.buyer-name")} value={buyer.facilityName || "-"} />
							<DetailRow label={t("admin.invoices.supplier-name")} value={supplier?.supplierName || "-"} />
							<DetailRow label={t("admin.insurers.insurer-name")} value={insurer.insurerName || "-"} />
							<DetailRow label={t("admin.collectors.collector-name")} value={collector.collectorName || "-"} />
							{/* <DetailRow
								label={t("admin.invoices.delivery-date")}
								value={deliveryDate ? dayjs(deliveryDate).format("DD MMM, YYYY") : "-"}
							/> */}
							
							
							{/* <DetailRow label={t("admin.invoices.invoice-status")} value={cancelledLabel} /> */}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
