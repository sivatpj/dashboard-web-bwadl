import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
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
import { Icon } from "@/components/global/icon";
import { useTranslationContext } from "@/contexts/translation";
import { formatCurrency } from "@/lib/format-currency";
import { getCollectionStatus } from "@/lib/get-collection-status";

dayjs.extend(utc);

const RiyalAmount = ({ value }: { value: string }) => (
	<span className="inline-flex items-center gap-1">
		<Icon className="h-3.5 w-3.5" name="Riyal" />
		{value}
	</span>
);

type InvoiceWithRelations = IInvoice & {
	collections: ICollection[];
	buyer: IBuyer;
	supplier: ISupplier;
	calcFirstInstallmentDate?: string | null;
	calcLastInstallmentDate?: string | null;
	calcInstallmentCount?: number;
};

interface SalesOrderDetailsProps extends ISalesOrder {
	buyer?: IBuyer;
	collector?: ICollector;
	insurer?: IInsurer;
	financier?: { facilityName?: string; financierName?: string };
	financierOffer?: IFinancierOffer;
	supplier?: ISupplier;
	invoices?: InvoiceWithRelations[];
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
	<div className="flex items-center justify-between py-2">
		<span className="text-[14px] text-[#5F6870]">{label}</span>
		<span className="text-[14px] font-semibold text-[#404040]">{value}</span>
	</div>
);

export const SalesOrderDetails = (props: SalesOrderDetailsProps) => {
	const {
		reference,
		amount,
		orderDate,
		orderType,
		settlementDate,
		isCancelled,
		isClosed,
		isManuallyVerified,
		buyer,
		supplier,
		collector,
		insurer,
		financier,
		financierOffer,
		invoices = [],
	} = props;

	const { t } = useTranslationContext();
	const firstInvoice = invoices[0];
	const firstInvoiceRelations = firstInvoice as
		| (InvoiceWithRelations & {
				collector?: Partial<ICollector>;
				financier?: { facilityName?: string; financierName?: string };
				financierOffer?: Partial<IFinancierOffer>;
				financierSupplierContract?: {
					financier?: { facilityName?: string; financierName?: string };
				};
				insurer?: Partial<IInsurer>;
		  })
		| undefined;
	const buyerName =
		buyer?.facilityName ||
		buyer?.buyerName ||
		firstInvoice?.buyer?.buyerName ||
		firstInvoice?.buyer?.facilityName ||
		"-";
	const supplierName =
		supplier?.supplierName ||
		supplier?.facilityName ||
		firstInvoice?.supplier?.supplierName ||
		firstInvoice?.supplier?.facilityName ||
		"-";
	const collectorName =
		collector?.collectorName ||
		collector?.facilityName ||
		firstInvoiceRelations?.collector?.collectorName ||
		firstInvoiceRelations?.collector?.facilityName ||
		"-";
	const insurerName =
		insurer?.insurerName ||
		insurer?.facilityName ||
		firstInvoiceRelations?.insurer?.insurerName ||
		firstInvoiceRelations?.insurer?.facilityName ||
		"-";
	const offerName =
		financierOffer?.offerName ||
		firstInvoiceRelations?.financierOffer?.offerName ||
		(props as ISalesOrder & { offer?: { offerName?: string } }).offer?.offerName ||
		"-";
	const financierName =
		firstInvoiceRelations?.financierSupplierContract?.financier?.financierName ||
		firstInvoiceRelations?.financierSupplierContract?.financier?.facilityName ||
		firstInvoiceRelations?.financier?.financierName ||
		firstInvoiceRelations?.financier?.facilityName ||
		financier?.financierName ||
		financier?.facilityName ||
		"-";
	const allCollections = invoices.flatMap(inv => inv.collections || []);
	const collectedAmount = invoices.reduce(
		(sum, inv) => sum + (inv.calcCollection || (inv as any).calcPaidAmount || 0),
		0,
	);
	const remainingAmount = amount - collectedAmount;
	const overdueAmount = invoices.reduce((sum, inv) => sum + (inv.calcOverdue || 0), 0);
	const totalFinancingAmount = invoices.reduce((sum, inv) => sum + (inv.financingAmount || 0), 0);
	const totalDifference = invoices.reduce((sum, inv) => sum + (inv.calcDifference || 0), 0);
	const totalDiscount =
		(financierOffer?.financierShare ?? 0) +(financierOffer?.supplierShare ?? 0)+
		(financierOffer?.insurerShare ?? 0) +
		(financierOffer?.collectorShare ?? 0) +
		(financierOffer?.bwadlShare ?? 0);
		
	const totalCancellationFees =
		(financierOffer?.financierShare ?? 0) * (financierOffer?.financierCancellationFees ?? 0)/100 +
		(financierOffer?.supplierShare ?? 0) * (financierOffer?.supplierCancellationFees ?? 0)/100 +
		(financierOffer?.insurerShare ?? 0) * (financierOffer?.insurerCancellationFees ?? 0)/100 +
		(financierOffer?.collectorShare ?? 0) * (financierOffer?.collectorCancellationFees ?? 0)/100 +
		(financierOffer?.bwadlShare ?? 0) * (financierOffer?.bwadlCancellationFees ?? 0)/100;
	const financingDate = orderDate
		? dayjs.utc(orderDate).add(financierOffer?.financingDateOffsetDays ?? 0, "day").format("YYYY-MM-DD")
		: orderDate;

		
	const settlementDateValue = settlementDate || firstInvoice?.settlementDate || null;

	const firstInstallmentDate = allCollections.length
		? allCollections.reduce((earliest, col) => {
				if (!earliest || col.eligibleAt < earliest) return col.eligibleAt;
				return earliest;
			}, "")
		: invoices.reduce<string | null>((earliest, inv) => {
				const value = inv.calcFirstInstallmentDate;
				if (!value) return earliest;
				if (!earliest || value < earliest) return value;
				return earliest;
			}, null);

	const lastInstallmentDate = allCollections.length
		? allCollections.reduce((latest, col) => {
				if (!latest || col.eligibleAt > latest) return col.eligibleAt;
				return latest;
			}, "")
		: invoices.reduce<string | null>((latest, inv) => {
				const value = inv.calcLastInstallmentDate;
				if (!value) return latest;
				if (!latest || value > latest) return value;
				return latest;
			}, null);

	const totalInstallments = allCollections.length
		? allCollections.length
		: invoices.reduce((sum, inv) => sum + (inv.calcInstallmentCount || 0), 0);

	const existingInvoicesTotal = invoices.reduce((sum, inv) => sum + (inv.invoiceAmount ?? inv.deliveryAmount ?? 0), 0);
	const totalDeliveryAmount = invoices.reduce((sum, inv) => sum + (inv.deliveryAmount ?? 0), 0);
	const deliveryDifference = amount - totalDeliveryAmount;
	const deliveryDifferenceColor = deliveryDifference < 0 ? "#D32F2F" : deliveryDifference > 0 ? "#C97A1F" : "#38A06C";
	const outstandingAmount = Math.max(existingInvoicesTotal - collectedAmount, 0);

	const offsetFromRaw = financierOffer?.financingDateOffsetFrom || "";
	const offsetFromLower = offsetFromRaw.toLowerCase();
	const isPreDeliveryOnly = !!financierOffer?.isPreDeliveryOnly;
	const isPostDeliveryOffer = !isPreDeliveryOnly && offsetFromLower === "delivery_date";
	const offsetFromLabel =
		offsetFromLower === "order_date"
			? t("admin.sales-orders.order-date")
			: offsetFromLower === "delivery_date"
				? t("admin.sales-orders.delivery-date")
				: offsetFromRaw || "-";

	const supplierAdvanceAmount = (amount * (financierOffer?.supplierAdvancePercentage ?? 0)) / 100;
	const totalDiscountAmount = (totalDiscount * amount) / 100;
	const financingAmount = supplierAdvanceAmount - totalDiscountAmount;

	const deliveryStatusKey = props.deliveryStatus ?? "not-delivered";
	const deliveryStatusColorMap: Record<string, string> = {
		"over-delivered": "#38A06C",
		delivered: "#38A06C",
		"partially-delivered": "#C97A1F",
		"not-delivered": "#D32F2F",
	};

	const orderStatus = isCancelled
		? t("admin.sales-orders.status-cancelled")
		: t(`admin.sales-orders.${deliveryStatusKey}`);

	const orderStatusColor = isCancelled ? "#D32F2F" : (deliveryStatusColorMap[deliveryStatusKey] ?? "#D32F2F");
	const orderTypeLabel =
		orderType === "contract"
			? t("admin.sales-orders.order-type-contract")
			: orderType === "order"
				? t("admin.sales-orders.order-type-order")
				: "-";
	const closedLabel = isClosed == null ? "-" : isClosed ? t("admin.sales-orders.yes") : t("admin.sales-orders.no");
	const manuallyVerifiedLabel =
		isManuallyVerified == null ? "-" : isManuallyVerified ? t("admin.sales-orders.yes") : t("admin.sales-orders.no");

	return (
		<div className="grid grid-cols-3 gap-4">
			{/* Sales Order Details */}
			<div className="flex overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
				<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
				<div className="flex-1 p-5">
					<h3 className="mb-4 text-[16px] font-bold text-[#404040]">{t("admin.sales-orders.sales-order-details")}</h3>
					<div className="flex flex-col divide-y divide-[#F0F0F0]">
						<DetailRow
							label={t("admin.sales-orders.order-date")}
							value={orderDate ? dayjs(orderDate).format("DD MMM, YYYY") : "-"}
						/>
						<DetailRow
							label={t("admin.sales-orders.financing-date")}
							value={financingDate ? dayjs.utc(financingDate).format("DD MMM, YYYY") : "-"}
						/>
						<DetailRow
							label={t("admin.sales-orders.sales-order-amount")}
							value={<RiyalAmount value={formatCurrency(totalFinancingAmount || amount, true)} />}
						/>
					{	<DetailRow
							label={t("admin.sales-orders.financing-amount")}
							value={<RiyalAmount value={formatCurrency(financingAmount || amount, true)} />}
						/> }
						<DetailRow
							label={t("admin.suppliers.delivery-status")}
							value={
								<span className="inline-flex items-center gap-1.5" style={{ color: orderStatusColor }}>
									<span className="h-2 w-2 rounded-full" style={{ backgroundColor: orderStatusColor }} />
									{orderStatus}
								</span>
							}
						/>
						{ <DetailRow
							label={t("admin.sales-orders.delivered-amount")}
							value={<RiyalAmount value={formatCurrency(totalDeliveryAmount, true)} />}
						/> }
						<DetailRow
							label={t("admin.sales-orders.difference")}
							value={
								<span style={{ color: deliveryDifferenceColor }}>
									<RiyalAmount
										value={`${deliveryDifference < 0 ? "-" : ""}${formatCurrency(Math.abs(deliveryDifference), true)}`}
									/>
								</span>
							}
						/>
							<DetailRow label={t("admin.sales-orders.order-type")} value={orderTypeLabel} />
							<DetailRow label={t("admin.sales-orders.closed")} value={closedLabel} />
							<DetailRow
							label={t("admin.sales-orders.collected-amount")}
							value={<RiyalAmount value={formatCurrency(collectedAmount, true)} />}
						/>
						<DetailRow
							label={t("admin.sales-orders.overdue-amount")}
							value={<RiyalAmount value={formatCurrency(overdueAmount, true)} />}
						/>

					{/* 	<DetailRow label={t("admin.sales-orders.order-number")} value={reference || "-"} /> */}
						
						
						
					
					{/* 	<DetailRow
							label={t("admin.sales-orders.remaining-amount")}
							value={<RiyalAmount value={formatCurrency(remainingAmount > 0 ? remainingAmount : 0, true)} />}
						/> */}
						
						{/* <DetailRow
							label={t("admin.sales-orders.first-installment-date")}
							value={firstInstallmentDate ? dayjs(firstInstallmentDate).format("DD MMM, YYYY") : "-"}
						/>
						<DetailRow
							label={t("admin.sales-orders.last-installment-date")}
							value={lastInstallmentDate ? dayjs(lastInstallmentDate).format("DD MMM, YYYY") : "-"}
						/> */}
						

						<DetailRow
							label={t("admin.sales-orders.outstanding")}
							value={<RiyalAmount value={formatCurrency(outstandingAmount, true)} />}
						/>
						
						{/* 	<DetailRow
								label={t("admin.sales-orders.invoices-dates")}
								value={
									invoices.length > 0 && invoices[0].createdAt
										? dayjs(invoices[0].createdAt).format("DD MMM, YYYY")
										: "-"
								}
							/> */}
					</div>
				</div>
			</div>

			{/* Offer Details */}
			<div className="flex overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
				<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
				<div className="flex-1 p-5">
					<h3 className="mb-4 text-[16px] font-bold text-[#404040]">{t("admin.sales-orders.offer-details")}</h3>
					<div className="flex flex-col divide-y divide-[#F0F0F0]">
						<DetailRow label={t("admin.sales-orders.offer-name")} value={offerName} />
						<DetailRow label={t("admin.sales-orders.financier")} value={financierName} />
							<DetailRow
							label={t("admin.sales-orders.offset-days")}
							value={`${financierOffer?.financingDateOffsetDays || 0} ${t("admin.sales-orders.days")}`}
						/>
						<DetailRow
							label={t("admin.sales-orders.offset-from")}
							value={offsetFromLabel}
						/>
						<DetailRow
							label={t("admin.sales-orders.predelivery-only")}
							value={financierOffer?.isPreDeliveryOnly ? t("admin.sales-orders.yes") : t("admin.sales-orders.no")}
						/>
						<DetailRow
							label={t("admin.sales-orders.supplier-advance-percentage")}
							value={`${financierOffer?.supplierAdvancePercentage || 0}%`} 
						/>
						<DetailRow label={t("admin.sales-orders.financial-share")} value={`${props.offerFinancierShare || 0}%`} />
						<DetailRow label={t("admin.sales-orders.accounting-fees")} value={`${props.offerBwadlShare || 0}%`} />
						<DetailRow label={t("admin.sales-orders.insurer-share")} value={`${props.offerInsurerShare || 0}%`} />
						<DetailRow label={t("admin.sales-orders.collector-share")} value={`${props.offerCollectorShare || 0}%`} />
						<DetailRow label={t("admin.sales-orders.supplier-share")} value={`${props.offerSupplierShare || 0}%`} />
						
					{/* 	<DetailRow
							label={t("admin.sales-orders.difference")}
							value={<RiyalAmount value={formatCurrency(totalDifference, true)} />}
						/> */}
							<DetailRow
								label={t("admin.sales-orders.discount")}
								value={`${totalDiscount.toFixed(2)}%`}
							/>
					
						
					{ 	<DetailRow
							label={t("admin.sales-orders.cancellation-fees")}
							value={`${totalCancellationFees.toFixed(2)}%`}
						/> }
					
						
					</div>
				</div>
			</div>

			{/* Other Details */}
			<div className="flex flex-col gap-4">
				<div className="flex overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<div className="flex-1 p-5">
						<h3 className="mb-4 text-[16px] font-bold text-[#404040]">{t("admin.sales-orders.other-details")}</h3>
						<div className="flex flex-col divide-y divide-[#F0F0F0]">
							<DetailRow label={t("admin.collectors.collector-name")} value={collectorName} />
							<DetailRow label={t("admin.insurers.insurer-name")} value={insurerName} />
							<DetailRow label={t("admin.sales-orders.buyer-name")} value={buyerName} />
							<DetailRow label={t("admin.sales-orders.supplier-name")} value={supplierName} />
							<DetailRow
								label={t("admin.sales-orders.invoice-repayment-period")}
								value={`${buyer?.repaymentPeriod || financierOffer?.repaymentPeriod || 0}`}
							/>
							<DetailRow
								label={t("admin.sales-orders.invoice-installment-number")}
								value={`${buyer?.installmentNumber || financierOffer?.installmentNumber || 0}`}
							/>

						{/* 	<DetailRow
								label={t("admin.sales-orders.invoice-repayment-period")}
								value={`${financierOffer?.repaymentPeriod || 0}`}
							/>
							 */}
							
							
							<DetailRow 
							label={t("admin.sales-orders.number-of-invoices")} 
							value={invoices.length} 
						/>
						<DetailRow
							label={t("admin.sales-orders.number-of-installments")}
							value={`${totalInstallments}`}
						/>
						<DetailRow
							label={t("admin.sales-orders.first-installment-date")}
							value={`${firstInstallmentDate ? dayjs(firstInstallmentDate).format("DD MMM, YYYY") : "-"}`}
						/>
						<DetailRow
							label={t("admin.sales-orders.last-installment-date")}
							value={`${lastInstallmentDate ? dayjs(lastInstallmentDate).format("DD MMM, YYYY") : "-"}`}
						/>
							
							{/* <DetailRow label={t("admin.sales-orders.manually-verified")} value={manuallyVerifiedLabel} /> */}
						</div>
					</div>
				</div>

				{/* Invoices Details card */}
				{/* <div className="flex overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<div className="flex-1 p-5">
						<h3 className="mb-3 text-[16px] font-bold text-[#404040]">{t("admin.sales-orders.invoices-details")}</h3>
						<div className="flex flex-col divide-y divide-[#F0F0F0]">
							<DetailRow label={t("admin.sales-orders.number-of-invoices")} value={invoices.length} />
							<DetailRow
								label={t("admin.sales-orders.invoices-dates")}
								value={
									invoices.length > 0 && invoices[0].createdAt
										? dayjs(invoices[0].createdAt).format("DD MMM, YYYY")
										: "-"
								}
							/>
						</div>
					</div>
				</div> */}
			</div>
		</div>
	);
};
