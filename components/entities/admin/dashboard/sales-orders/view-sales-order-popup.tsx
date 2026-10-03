"use client";

import { useFetchBuyers } from "@/api/endpoints/back-office/buyers/fetch-buyers";
import { useFetchCollectors } from "@/api/endpoints/back-office/collectors/fetch-collectors";
import { useFetchFinancierOffers } from "@/api/endpoints/back-office/financiers/financier-offers/fetch-financier-offers";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { useFetchInsurers } from "@/api/endpoints/back-office/insurers/fetch-insurers";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
import { ISalesOrder } from "@/api/types";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslationContext } from "@/contexts/translation";

interface ViewSalesOrderPopupProps {
	salesOrder: ISalesOrder;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const ViewSalesOrderPopup = ({ salesOrder, open, onOpenChange }: ViewSalesOrderPopupProps) => {
	const { t } = useTranslationContext();

	const { data: buyersData } = useFetchBuyers({}, { enabled: open });
	const { data: suppliersData } = useFetchSuppliers({}, { enabled: open });
	const { data: financiersData } = useFetchFinanciers({}, { enabled: open });
	const { data: insurersData } = useFetchInsurers({}, { enabled: open });
	const { data: collectorsData } = useFetchCollectors({}, { enabled: open });
	const { data: financierOffersData } = useFetchFinancierOffers({}, { enabled: open });

	const selectedBuyer = buyersData?.buyers.find(b => b.id === salesOrder.buyerId);
	const selectedSupplier = suppliersData?.suppliers.find(s => s.id === salesOrder.supplierId);
	const selectedCollector = collectorsData?.collectors.find(c => c.id === salesOrder.collectorId);
	const selectedInsurer = insurersData?.insurers.find(i => i.id === salesOrder.insurerId);
	const selectedOffer = financierOffersData?.financierOffers.find(o => o.id === salesOrder.offerId);
	const selectedFinancier = financiersData?.financiers.find(f =>
		f.financierSupplierContracts.some(c => c.financierOffers.some(o => o.id === salesOrder.offerId)),
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[95%] max-w-[900px] overflow-y-auto p-0 sm:w-[85%] lg:w-[70%]">
				<div className="rounded-md bg-[#EAF4FB] px-4 py-4 sm:px-8">
					<div className="flex flex-col gap-5">
						<h2 className="text-[22px] font-bold text-[#313740]">{t("admin.sales-orders.view-sales-order")}</h2>

						<div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2 lg:gap-x-14">
							<Input
								label="Sales Order Number"
								name="invoiceReference"
								type="text"
								value={salesOrder.reference || ""}
								disabled
								readOnly
							/>

							<Input
								label={t("admin.sales-orders.buyer-name")}
								name="buyerName"
								type="text"
								value={
									selectedBuyer
										? `${selectedBuyer.buyerName || ""} (${selectedBuyer.crNumber || ""})`
										: String(salesOrder.buyerId || "")
								}
								disabled
								readOnly
							/>

							<Input
								label={t("admin.sales-orders.supplier-name")}
								name="supplierName"
								type="text"
								value={
									selectedSupplier
										? `${selectedSupplier.supplierName || ""} (${selectedSupplier.crNumber || ""})`
										: String(salesOrder.supplierId || "")
								}
								disabled
								readOnly
							/>

							<AmountInput
								label={t("admin.sales-orders.invoice-amount")}
								name="invoiceAmount"
								placeholder={t("admin.sales-orders.invoice-amount-placeholder")}
								value={salesOrder.amount || 0}
								onChange={() => {}}
								disabled
							/>

							<DateInput
								label={t("admin.sales-orders.invoice-date")}
								placeholder={t("admin.sales-orders.invoice-date-placeholder")}
								value={salesOrder.orderDate || undefined}
								onChange={() => {}}
								disabled
							/>
						</div>

						<Separator className="bg-[#D5E1E9]" />

						<div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2 lg:gap-x-14">
							<Input
								label={t("admin.sales-orders.financier")}
								name="financierName"
								type="text"
								value={selectedFinancier?.financierName || ""}
								disabled
								readOnly
							/>

							<Input
								label={t("admin.sales-orders.offer")}
								name="offerName"
								type="text"
								value={selectedOffer?.offerName || ""}
								disabled
								readOnly
							/>

							<Input
								label={t("admin.sales-orders.insurer")}
								name="insurerName"
								type="text"
								value={selectedInsurer?.insurerName || ""}
								disabled
								readOnly
							/>

							<Input
								label={t("admin.sales-orders.collector")}
								name="collectorName"
								type="text"
								value={selectedCollector?.collectorName || ""}
								disabled
								readOnly
							/>

							<div className="flex flex-col gap-2">
								<label className="text-sm font-medium text-[#313740]">Closed</label>
								<div className="flex items-center gap-2">
									<input
										checked={Boolean(salesOrder.isClosed)}
										className="h-4 w-4 cursor-pointer accent-[#3D434C]"
										id="isClosed"
										type="checkbox"
										disabled
									/>
									<label className="text-sm text-[#606A74]" htmlFor="isClosed">
										Mark this sales order as closed
									</label>
								</div>
							</div>
						</div>

						<div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:justify-end">
							<Button
								className="h-11 w-full border border-[#3D434C] bg-white text-[#313740] hover:bg-[#F4F7FA] sm:w-[172px]"
								type="button"
								onClick={() => onOpenChange(false)}
							>
								{t("admin.common.close")}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
