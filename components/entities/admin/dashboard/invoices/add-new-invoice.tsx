"use client";

import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFetchBuyers } from "@/api/endpoints/back-office/buyers/fetch-buyers";
import { useFetchCollectors } from "@/api/endpoints/back-office/collectors/fetch-collectors";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { useFetchInsurers } from "@/api/endpoints/back-office/insurers/fetch-insurers";
import { useCreateInvoice } from "@/api/endpoints/back-office/invoices/create-invoice.api";
import { useFetchParticipantDefaults } from "@/api/endpoints/back-office/participant-defaults/fetch-participant-defaults";
import { useFetchSalesOrders } from "@/api/endpoints/back-office/sales-orders/fetch-sales-orders";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { AutoCompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface AddNewInvoiceProps {
	buyerId?: number;
	supplierId?: number;
	collectorId?: number;
	salesOrderId?: number;
	salesOrderAmount?: number;
	existingInvoicesTotal?: number;
	disabled?: boolean;
	extraSalesOrders?: Array<{
		id: number;
		reference: string;
	}>;
	size?: React.ComponentProps<typeof Button>["size"];
}

export const AddNewInvoice = (props: AddNewInvoiceProps) => {
	const {
		buyerId,
		supplierId,
		collectorId,
		salesOrderId: salesOrderIdProp,
		disabled = false,
		extraSalesOrders = [],
		size,
	} = props;

	const [open, setOpen] = useState(false);
	const [buyerSearch, setBuyerSearch] = useState("");
	const [supplierSearch, setSupplierSearch] = useState("");
	const [salesOrderSearch, setSalesOrderSearch] = useState("");
	const router = useRouter();

	const { toast } = useToast();

	const { t } = useTranslationContext();

	const queryClient = useQueryClient();

	const { data: buyersData, isLoading: isBuyersLoading } = useFetchBuyers({}, { enabled: open });
	const { data: suppliersData, isLoading: isSuppliersLoading } = useFetchSuppliers(
		{},
		{
			enabled: open,
			select: data => {
				if (data.suppliers.length === 1) {
					setFieldValue("supplierId", data.suppliers[0].id);
				}
				return data;
			},
		},
	);
	const { data: financiersData } = useFetchFinanciers(
		{},
		{
			enabled: open,
			select: data => {
				if (data.financiers.length === 1) {
					setFieldValue("financierId", data.financiers[0].id);
				}
				return data;
			},
		},
	);
	const { data: insurersData } = useFetchInsurers(
		{},
		{
			enabled: open,
			select: data => {
				if (data.insurers.length === 1) {
					setFieldValue("insurerId", data.insurers[0].id);
				}
				return data;
			},
		},
	);
	const { data: collectorsData } = useFetchCollectors(
		{},
		{
			enabled: open,
			select: data => {
				if (data.collectors.length === 1) {
					setFieldValue("collectorId", data.collectors[0].id);
				}
				return data;
			},
		},
	);
	const { data: salesOrdersData, isLoading: isSalesOrdersLoading } = useFetchSalesOrders(
		{},
		{ enabled: open && !salesOrderIdProp },
	);

	const mergedSalesOrders = [
		...extraSalesOrders,
		...((salesOrdersData?.salesOrders ?? []).map(order => ({ id: order.id, reference: order.reference })) ?? []),
	].filter((order, index, orders) => orders.findIndex(item => item.id === order.id) === index);

	const { mutate, isPending } = useCreateInvoice({
		onError: err => {
			const error = err.response?.data.error;
			if (error.endsWith("does not have enough credit limit for this invoice")) {
				if (error.startsWith("Buyer")) {
					toast({
						description: t("admin.invoices.validation.insufficient-credit-limit.buyer"),
						title: t("admin.invoices.validation.insufficient-credit-limit.title"),
						variant: "destructive",
					});
				}

				if (error.startsWith("Supplier")) {
					toast({
						description: t("admin.invoices.validation.insufficient-credit-limit.supplier"),
						title: t("admin.invoices.validation.insufficient-credit-limit.title"),
						variant: "destructive",
					});
				}

				if (error.startsWith("Financier")) {
					toast({
						description: t("admin.invoices.validation.insufficient-credit-limit.financier"),
						title: t("admin.invoices.validation.insufficient-credit-limit.title"),
						variant: "destructive",
					});
				}

				if (error.startsWith("Contract")) {
					toast({
						description: t("admin.invoices.validation.insufficient-credit-limit.contract"),
						title: t("admin.invoices.validation.insufficient-credit-limit.title"),
						variant: "destructive",
					});
				}
			} else {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "invoices"] });
			queryClient.invalidateQueries({ queryKey: ["back-office", "sales-orders"] });
			if (buyerId)
				queryClient.invalidateQueries({
					queryKey: ["back-office", "buyers", String(buyerId)],
				});
			if (supplierId)
				queryClient.invalidateQueries({
					queryKey: ["back-office", "suppliers", String(supplierId)],
				});
			if (salesOrderIdProp)
				queryClient.invalidateQueries({
					queryKey: ["back-office", "sales-orders", String(salesOrderIdProp), "invoices"],
				});
		},
		onSuccess: response => {
			setOpen(false);
			resetForm();
			queryClient.refetchQueries({ queryKey: ["back-office", "invoices"], type: "active" });
			queryClient.refetchQueries({ queryKey: ["back-office", "sales-orders"], type: "active" });
			if (salesOrderIdProp) {
				queryClient.refetchQueries({
					queryKey: ["back-office", "sales-orders", String(salesOrderIdProp), "invoices"],
					type: "active",
				});
			}

			const createdInvoice = response.invoice;
			const createdBuyerId = createdInvoice.buyerId || buyerId || values.buyerId;
			if (createdInvoice.id && createdBuyerId) {
				const selectedOrder = mergedSalesOrders.find(order => order.id === (salesOrderIdProp || values.salesOrderId));
				const query = salesOrderIdProp
					? `?salesOrderId=${salesOrderIdProp}&salesOrderRef=${encodeURIComponent(selectedOrder?.reference || "")}`
					: "";
				router.push(`${config.PATHS.dashboard.ADMIN.invoice(createdInvoice.id, createdBuyerId)}${query}`);
			}
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		invoiceReference?: string;
		invoiceAmount: number;
		orderDate?: string;
		financingAmount?: number;
		deliveryAmount?: number;
		isCancelled?: boolean;
		isManuallyVerified?: boolean;
		additionalInfo?: any;
		buyerId: number;
		supplierId: number;
		financierId: number;
		collectorId: number;
		financingDate?: string;
		settlementDate?: string;
		deliveryDate?: string;
		insurerId: number;
		financialOfferId: number;
		salesOrderId: number;
	}>({
		initialValues: {
			additionalInfo: {},
			buyerId: buyerId || Number(),
			collectorId: collectorId || Number(),
			deliveryAmount: Number(),
			financialOfferId: Number(),
			financierId: Number(),
			financingAmount: Number(),
			financingDate: String(),
			insurerId: Number(),
			invoiceAmount: Number(),
			isCancelled: false,
			isManuallyVerified: false,
			orderDate: dayjs().toISOString(),
			salesOrderId: salesOrderIdProp || Number(),
			settlementDate: String(),
			supplierId: supplierId || Number(),
		},
		onSubmit: values => {
			const {
				deliveryAmount: _deliveryAmount,
				deliveryDate: _deliveryDate,
				settlementDate: _settlementDate,
				...invoiceValues
			} = values;
			const body = {
				...invoiceValues,
				amount: values.invoiceAmount,
				reference: values.invoiceReference,
			};
			if (!body.financingDate) delete body.financingDate;
			mutate({
				...body,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.orderDate) {
				errors.orderDate = t("admin.invoices.validation.invoice-date");
			}

			if (!values.financierId) {
				errors.financierId = t("admin.invoices.validation.financier");
			}

			if (!values.supplierId) {
				errors.supplierId = t("admin.invoices.validation.supplier");
			}

			if (!values.buyerId) {
				errors.buyerId = t("admin.invoices.validation.buyer");
			}

			if (!values.invoiceReference) {
				errors.invoiceReference = t("admin.invoices.validation.invoice-number");
			}

			if (!values.collectorId) {
				errors.collectorId = t("admin.invoices.validation.collector");
			}

			if (!values.insurerId) {
				errors.insurerId = t("admin.invoices.validation.insurer");
			}

			if (!values.financialOfferId) {
				errors.financialOfferId = t("admin.invoices.validation.financial-offer");
			}

			if (!values.salesOrderId) {
				errors.salesOrderId = t("admin.invoices.validation.sales-order");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	const { data: participantDefaultsData } = useFetchParticipantDefaults(
		{ id: values.buyerId, type: "buyer" },
		{ enabled: open && !!values.buyerId },
	);

	useEffect(() => {
		if (!participantDefaultsData?.participantDefaults) return;

		const { collectorId, financierOfferId, supplierId, insurerId } = participantDefaultsData.participantDefaults;
		if (collectorId) setFieldValue("collectorId", collectorId);
		if (financierOfferId) {
			setFieldValue("financialOfferId", financierOfferId);
			const financier = financiersData?.financiers.find(f =>
				f.financierSupplierContracts.some(c => c.financierOffers.some(o => o.id === financierOfferId)),
			);
			if (financier) setFieldValue("financierId", financier.id);
		}
		if (supplierId) setFieldValue("supplierId", supplierId);
		if (insurerId) setFieldValue("insurerId", insurerId);
	}, [participantDefaultsData]);

	const buyer = buyersData?.buyers.find(b => b.id === (values.buyerId || buyerId));
	const supplier = suppliersData?.suppliers.find(s => s.id === (values.supplierId || supplierId));
	const financier = financiersData?.financiers.find(f => f.id === values.financierId);
	const selectedOffer = financier?.financierSupplierContracts
		.flatMap(c => c.financierOffers)
		.find(o => o.id === values.financialOfferId);

	// order_date = Today's date
	// , financing_date 	= order_date 	+ offer.financing_date_offset_days
	// , delivery_date 	   = order_date 	+ offer.delivery_date_offset_days
	// , settlement_date    = delivery_date   + offer.repayment_period

	useEffect(() => {
		if (!values.orderDate || !selectedOffer) return;

		const financingOffDays = selectedOffer?.financingDateOffsetDays ?? 0;

		if (selectedOffer.financingDateOffsetFrom === "delivery_date") {
			setFieldValue("financingDate", "");
			return;
		}

		setFieldValue("financingDate", dayjs(values.orderDate).add(financingOffDays, "day").toISOString());
	}, [values.orderDate, selectedOffer]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size={size} disabled={disabled}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.buyer.add-new-invoice")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-auto w-[70%] p-0">
				<div className="rounded-md bg-[#EAF4FB] px-8 py-4">
					<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.invoices.add-new-invoice")}</h2>
							<p className="text-sm text-gray-600">{t("admin.invoices.add-new-invoice-description")}</p>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{!buyerId && !supplierId && (
								<>
									<AutoCompleteInput
										isLoading={isBuyersLoading}
										items={
											buyersData?.buyers.map(buyer => ({
												label: `${buyer.buyerName} (${buyer.crNumber})`,
												value: buyer.id,
											})) ?? []
										}
										label={t("admin.invoices.search-buyer")}
										placeholder={t("admin.invoices.buyer-search-placeholder")}
										searchValue={buyerSearch}
										selectedValue={values.buyerId}
										onSearchValueChange={setBuyerSearch}
										onSelectedValueChange={value => setFieldValue("buyerId", value)}
										error={errors.buyerId}
										onClear={() => {
											setFieldValue("buyerId", 0);
											setBuyerSearch("");
											setFieldValue("collectorId", 0);
											setFieldValue("financierId", 0);
											setFieldValue("financialOfferId", 0);
											setFieldValue("insurerId", 0);
										}}
									/>

									<AutoCompleteInput
										isLoading={isSuppliersLoading}
										items={
											suppliersData?.suppliers.map(supplier => ({
												label: `${supplier.supplierName} (${supplier.crNumber})`,
												value: supplier.id,
											})) ?? []
										}
										label={t("admin.invoices.search-supplier")}
										placeholder={t("admin.invoices.search-supplier-placeholder")}
										searchValue={supplierSearch}
										selectedValue={values.supplierId}
										onSearchValueChange={setSupplierSearch}
										onSelectedValueChange={value => setFieldValue("supplierId", value)}
									/>
								</>
							)}

							<Input
								label={t("admin.invoices.invoice-number")}
								name="crNumber"
								placeholder={t("admin.invoices.invoice-number-placeholder")}
								type="text"
								error={errors.invoiceReference}
								value={values.invoiceReference || ""}
								onChange={e => setFieldValue("invoiceReference", e.target.value)}
							/>

							{buyerId && (
								<>
									<Input
										label={t("admin.invoices.buyer-name")}
										name="buyerName"
										placeholder={t("admin.invoices.buyer-name-placeholder")}
										type="text"
										value={buyer ? `${buyer.buyerName || ""} (${buyer.crNumber || ""})` : ""}
										disabled
										readOnly
									/>

									<AutoCompleteInput
										isLoading={isSuppliersLoading}
										items={
											suppliersData?.suppliers.map(supplier => ({
												label: `${supplier.supplierName} (${supplier.crNumber})`,
												value: supplier.id,
											})) ?? []
										}
										label={t("admin.invoices.search-supplier")}
										placeholder={t("admin.invoices.search-supplier-placeholder")}
										searchValue={supplierSearch}
										selectedValue={values.supplierId}
										onSearchValueChange={setSupplierSearch}
										onSelectedValueChange={value => setFieldValue("supplierId", value)}
										onClear={() => {
											setFieldValue("supplierId", 0);
											setSupplierSearch("");
											setFieldValue("financialOfferId", 0);
										}}
									/>
								</>
							)}

							{supplierId && (
								<>
									<Input
										label={t("admin.invoices.supplier-name")}
										name="supplierName"
										placeholder={t("admin.invoices.supplier-name-placeholder")}
										type="text"
										value={supplier ? `${supplier.supplierName || ""} (${supplier.crNumber || ""})` : ""}
										disabled
										readOnly
									/>

									<AutoCompleteInput
										isLoading={isBuyersLoading}
										items={
											buyersData?.buyers.map(buyer => ({
												label: `${buyer.buyerName} (${buyer.crNumber})`,
												value: buyer.id,
											})) ?? []
										}
										label={t("admin.invoices.search-buyer")}
										placeholder={t("admin.invoices.buyer-search-placeholder")}
										searchValue={buyerSearch}
										selectedValue={values.buyerId}
										onSearchValueChange={setBuyerSearch}
										onSelectedValueChange={value => setFieldValue("buyerId", value)}
										error={errors.buyerId}
										onClear={() => {
											setFieldValue("buyerId", 0);
											setBuyerSearch("");
											setFieldValue("collectorId", 0);
											setFieldValue("financierId", 0);
											setFieldValue("financialOfferId", 0);
											setFieldValue("insurerId", 0);
										}}
									/>
								</>
							)}

							<Select
								label={t("admin.invoices.financier")}
								value={String(values.financierId)}
								onValueChange={v => setFieldValue("financierId", +v)}
							>
								<SelectTrigger error={errors.financierId}>
									<SelectValue placeholder={t("admin.invoices.financier-placeholder")} />
								</SelectTrigger>

								<SelectContent>
									{financiersData?.financiers.map(financier => (
										<SelectItem key={financier.id} value={String(financier.id)}>
											{financier.financierName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								disabled={!financier || !values.supplierId}
								label={t("admin.invoices.offer")}
								value={String(values.financialOfferId)}
								onValueChange={v => {
									const offerId = +v;
									setFieldValue("deliveryDate", "");
									setFieldValue("financialOfferId", offerId);
								}}
							>
								<SelectTrigger error={errors.financialOfferId}>
									<SelectValue placeholder={t("admin.invoices.offer-placeholder")} />
								</SelectTrigger>

								<SelectContent>
									{financier?.financierSupplierContracts
										.filter(fsc => fsc.supplierId === values.supplierId)
										.flatMap(contract =>
											contract.financierOffers.map(offer => (
												<SelectItem key={offer.id} value={String(offer.id)}>
													{offer.offerName}
												</SelectItem>
											)),
										)}
								</SelectContent>
							</Select>

							<Select
								label={t("admin.invoices.insurer")}
								value={String(values.insurerId)}
								onValueChange={v => setFieldValue("insurerId", +v)}
							>
								<SelectTrigger error={errors.insurerId}>
									<SelectValue placeholder={t("admin.invoices.insurer-placeholder")} />
								</SelectTrigger>

								<SelectContent>
									{insurersData?.insurers.map(insurer => (
										<SelectItem key={insurer.id} value={String(insurer.id)}>
											{insurer.insurerName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								label={t("admin.invoices.collector")}
								value={String(values.collectorId)}
								onValueChange={v => setFieldValue("collectorId", +v)}
							>
								<SelectTrigger error={errors.collectorId}>
									<SelectValue placeholder={t("admin.invoices.collector-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									{collectorsData?.collectors.map(collector => (
										<SelectItem key={collector.id} value={String(collector.id)}>
											{collector.collectorName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{!salesOrderIdProp && (
								<AutoCompleteInput
									isLoading={isSalesOrdersLoading}
									items={mergedSalesOrders.map(order => ({
										label: order.reference,
										value: order.id,
									}))}
									label={t("admin.invoices.sales-order")}
									placeholder={t("admin.invoices.sales-order-placeholder")}
									searchValue={salesOrderSearch}
									selectedValue={values.salesOrderId}
									onSearchValueChange={setSalesOrderSearch}
									onSelectedValueChange={value => setFieldValue("salesOrderId", value)}
									error={errors.salesOrderId}
									onClear={() => {
										setFieldValue("salesOrderId", 0);
										setSalesOrderSearch("");
									}}
								/>
							)}

							<div className="sm:col-span-2">
								<Separator className="bg-[#D9D9D9]" />
							</div>

							<DateInput
								error={errors.orderDate}
								label={t("admin.invoices.invoice-date")}
								placeholder={t("admin.invoices.invoice-date-placeholder")}
								value={values.orderDate}
								onChange={date => setFieldValue("orderDate", date)}
							/>

							<DateInput
								label={t("admin.invoices.financing-date")}
								value={values.financingDate}
								onChange={date => setFieldValue("financingDate", date)}
								placeholder={t("admin.invoices.financing-date-placeholder")}
							/>

							<div className="hidden">
								<DateInput
									label={t("admin.invoices.settlement-date")}
									value={values.settlementDate}
									placeholder={t("admin.invoices.settlement-date-placeholder")}
									onChange={date => setFieldValue("settlementDate", date)}
									readOnly
								/>
								<Select
									label={t("admin.invoices.invoice-status")}
									value={values.isCancelled ? "Canceled" : "Active"}
									onValueChange={value => setFieldValue("isCancelled", value === "Canceled")}
								>
									<SelectTrigger error={errors.isCancelled}>
										<SelectValue placeholder="Active" />
									</SelectTrigger>

									<SelectContent>
										<SelectItem value="Active">{t("admin.invoices.status-active")}</SelectItem>
										{/* <SelectItem value="Pending">{t("admin.invoices.status-pending")}</SelectItem> */}
										<SelectItem value="Canceled">{t("admin.invoices.status-cancelled")}</SelectItem>
										{/* <SelectItem value="Completed">{t("admin.invoices.status-completed")}</SelectItem> */}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex justify-end gap-3">
							<Button
								className="h-10 w-[200px] border border-[#404040] bg-[#969696] text-black hover:bg-[#7f7f7f]"
								type="button"
								onClick={() => setOpen(false)}
							>
								{t("admin.common.cancel")}
							</Button>

							<Button
								className="h-10 w-[200px] bg-[#404040] font-semibold text-white hover:bg-[#2f2f2f]"
								loading={isPending}
								type="submit"
							>
								{t("admin.invoices.add-invoice")}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
