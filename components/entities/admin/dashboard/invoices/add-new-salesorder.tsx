"use client";

import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useFetchBuyers } from "@/api/endpoints/back-office/buyers/fetch-buyers";
import { useFetchCollectors } from "@/api/endpoints/back-office/collectors/fetch-collectors";
import { useFetchFinancierOffers } from "@/api/endpoints/back-office/financiers/financier-offers/fetch-financier-offers";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { useFetchInsurers } from "@/api/endpoints/back-office/insurers/fetch-insurers";
import { useFetchParticipantDefaults } from "@/api/endpoints/back-office/participant-defaults/fetch-participant-defaults";
import { useCreateSalesOrder } from "@/api/endpoints/back-office/sales-orders/create-sales-order";
import { useUpdateSalesOrder } from "@/api/endpoints/back-office/sales-orders/update-sales-order.api";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
import { ISalesOrder } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { AutoCompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

type CreatedSalesOrder = {
	id: number;
	reference: string;
	amount: number;
	orderDate: string | null;
	orderType: string | null;
	isCancelled: boolean | null;
	isClosed: boolean | null;
	isManuallyVerified: boolean | null;
	buyer?: { buyerName?: string | null };
	supplier?: { supplierName?: string | null };
	collector?: { collectorName?: string | null };
	insurer?: { insurerName?: string | null };
	offer?: { offerName?: string | null };
};

interface AddNewSalesOrderProps {
	buyerId?: number;
	salesOrder?: ISalesOrder;
	open?: boolean;
	onSalesOrderCreated?: (salesOrder: CreatedSalesOrder) => void;
	onOpenChange?: (open: boolean) => void;
	size?: React.ComponentProps<typeof Button>["size"];
}

export const AddNewSalesOrder = (props: AddNewSalesOrderProps) => {
	const { buyerId, salesOrder, onSalesOrderCreated, onOpenChange, open: controlledOpen, size } = props;
	const isEditing = !!salesOrder;

	const [internalOpen, setInternalOpen] = useState(false);
	const [buyerSearch, setBuyerSearch] = useState("");
	const [supplierSearch, setSupplierSearch] = useState("");
	const [financierSearch, setFinancierSearch] = useState("");
	const [offerSearch, setOfferSearch] = useState("");
	const [insurerSearch, setInsurerSearch] = useState("");
	const [collectorSearch, setCollectorSearch] = useState("");
	const [showAllOffers, setShowAllOffers] = useState(false);
	const open = controlledOpen ?? internalOpen;
	const setOpen = (nextOpen: boolean) => {
		setInternalOpen(nextOpen);
		onOpenChange?.(nextOpen);
	};

	const { toast } = useToast();
	const { t } = useTranslationContext();
	const queryClient = useQueryClient();

	const { data: buyersData, isLoading: isBuyersLoading } = useFetchBuyers({}, { enabled: open });
	const { data: suppliersData, isLoading: isSuppliersLoading } = useFetchSuppliers({}, { enabled: open });
	const { data: financiersData } = useFetchFinanciers({}, { enabled: open });
	const { data: insurersData } = useFetchInsurers({}, { enabled: open });
	const { data: collectorsData } = useFetchCollectors({}, { enabled: open });
	const { data: financierOffersData } = useFetchFinancierOffers({}, { enabled: open });

	const { mutate, isPending } = useCreateSalesOrder({
		onError: err => {
			const backendError = err.response?.data.error;
			toast({
				description:
					backendError === "Bwadl participant not found"
						? "Buyer participant defaults are missing a Bwadl participant. Update the buyer defaults and try again."
						: backendError || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "sales-orders"] });
			queryClient.refetchQueries({ queryKey: ["back-office", "sales-orders"], type: "active" });
			queryClient.invalidateQueries({ queryKey: ["back-office", "financiers"] });
			queryClient.invalidateQueries({ queryKey: ["back-office", "buyers"] });
			queryClient.invalidateQueries({ queryKey: ["back-office", "suppliers"] });
		},
		onSuccess: data => {
			const createdSalesOrder: CreatedSalesOrder = {
				...data.salesOrder,
				buyer: selectedBuyer ? { buyerName: selectedBuyer.buyerName } : undefined,
				collector: selectedCollector ? { collectorName: selectedCollector.collectorName } : undefined,
				insurer: selectedInsurer ? { insurerName: selectedInsurer.insurerName } : undefined,
				offer: selectedOffer ? { offerName: selectedOffer.offerName } : undefined,
				supplier: selectedSupplier ? { supplierName: selectedSupplier.supplierName } : undefined,
			};

			onSalesOrderCreated?.(createdSalesOrder);

			queryClient.invalidateQueries({ queryKey: ["back-office", "sales-orders"] });
			queryClient.refetchQueries({ queryKey: ["back-office", "sales-orders"], type: "active" });
			queryClient.invalidateQueries({ queryKey: ["back-office", "invoices"] });

			setOpen(false);
			resetForm();
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		invoiceReference?: string;
		invoiceAmount: number;
		isCancelled: boolean;
		isManuallyVerified: boolean;
		orderType: "contract" | "order";
		orderDate?: string;
		buyerId: number;
		supplierId: number;
		financierId: number;
		collectorId: number;
		insurerId: number;
		financialOfferId: number;
		invoiceStatus?: string;
	}>({
		initialValues: {
			buyerId: buyerId || Number(),
			collectorId: Number(),
			financialOfferId: Number(),
			financierId: Number(),
			insurerId: Number(),
			invoiceAmount: Number(),
			invoiceStatus: "Active",
			isCancelled: false,
			isManuallyVerified: false,
			orderDate: dayjs().toISOString(),
			orderType: "order",
			supplierId: Number(),
		},
		onSubmit: values => {
			const payload = {
				amount: values.invoiceAmount,
				buyerId: values.buyerId || undefined,
				bwadlId: participantDefaultsData?.participantDefaults?.bwadlId || undefined,
				collectorId: values.collectorId || undefined,
				insurerId: values.insurerId || undefined,
				isCancelled: values.isCancelled,
				isClosed: false,
				isManuallyVerified: values.isManuallyVerified,
				offerId: values.financialOfferId || undefined,
				orderDate: values.orderDate ? dayjs(values.orderDate).format("YYYY-MM-DD") : undefined,
				orderType: values.orderType,
				reference: values.invoiceReference,
				supplierId: values.supplierId || undefined,
			};

			mutate(payload);
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.invoiceReference) {
				errors.invoiceReference = t("admin.sales-orders.validation.invoice-number");
			}

			if (!values.buyerId) {
				errors.buyerId = t("admin.sales-orders.validation.buyer");
			}

			if (!values.supplierId) {
				errors.supplierId = t("admin.sales-orders.validation.supplier");
			}

			if (values.invoiceAmount <= 0) {
				errors.invoiceAmount = t("admin.sales-orders.validation.invoice-amount");
			}

			if (!values.orderDate) {
				errors.orderDate = t("admin.sales-orders.validation.invoice-date");
			}

			if (!values.financierId) {
				errors.financierId = t("admin.sales-orders.validation.financier");
			}

			if (!values.financialOfferId) {
				errors.financialOfferId = t("admin.sales-orders.validation.financial-offer");
			}

			if (!values.insurerId) {
				errors.insurerId = t("admin.sales-orders.validation.insurer");
			}

			if (!values.collectorId) {
				errors.collectorId = t("admin.sales-orders.validation.collector");
			}

			if (values.invoiceAmount < 0) {
				errors.invoiceAmount = t("admin.sales-orders.validation.positive-invoice-amount");
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
		if (suppliersData?.suppliers.length === 1) {
			setFieldValue("supplierId", suppliersData.suppliers[0].id);
		}
	}, [suppliersData]);

	useEffect(() => {
		if (financiersData?.financiers.length === 1) {
			setFieldValue("financierId", financiersData.financiers[0].id);
		}
	}, [financiersData]);

	useEffect(() => {
		if (insurersData?.insurers.length === 1) {
			setFieldValue("insurerId", insurersData.insurers[0].id);
		}
	}, [insurersData]);

	useEffect(() => {
		if (collectorsData?.collectors.length === 1) {
			setFieldValue("collectorId", collectorsData.collectors[0].id);
		}
	}, [collectorsData]);

	// All contracts flattened — financierId injected from parent to be safe
	const allContracts = useMemo(
		() =>
			(financiersData?.financiers ?? []).flatMap(f =>
				f.financierSupplierContracts.map(c => ({
					...c,
					financierId: f.id,
					supplierId: (c.supplierId ?? (c as any).supplier_id) as number,
					id: (c.id ?? (c as any).id) as number,
				})),
			),
		[financiersData],
	);

	// Contracts for selected supplier
	const supplierContracts = useMemo(() => {
		if (!values.supplierId) return null;
		return allContracts.filter(c => c.supplierId === values.supplierId);
	}, [values.supplierId, allContracts]);

	useEffect(() => {
		if (!participantDefaultsData?.participantDefaults) return;

		const { collectorId, financierOfferId, supplierId, insurerId } = participantDefaultsData.participantDefaults;

		if (collectorId) setFieldValue("collectorId", collectorId);
		if (financierOfferId) {
			setFieldValue("financialOfferId", financierOfferId);
			const offerData = financierOffersData?.financierOffers.find(o => o.id === financierOfferId);
			const matchingContract = allContracts.find(c => c.id === offerData?.financierSupplierContractsId);
			if (matchingContract) {
				const matchingFinancier = financiersData?.financiers.find(f => f.id === matchingContract.financierId);
				if (matchingFinancier) setFieldValue("financierId", matchingFinancier.id);
			}
		}
		if (supplierId) setFieldValue("supplierId", supplierId);
		if (insurerId) setFieldValue("insurerId", insurerId);
	}, [participantDefaultsData, financiersData, financierOffersData, allContracts]);

	// Suppliers filtered by selected financier
	const filteredSuppliers = useMemo(() => {
		const all = suppliersData?.suppliers ?? [];
		if (!values.financierId) return all;
		const supplierIds = new Set(allContracts.filter(c => c.financierId === values.financierId).map(c => c.supplierId));
		return all.filter(s => supplierIds.has(s.id));
	}, [values.financierId, suppliersData, allContracts]);

	// Financiers filtered by selected supplier
	const filteredFinanciers = useMemo(() => {
		const all = financiersData?.financiers ?? [];
		if (!values.supplierId) return all;
		const financierIds = new Set((supplierContracts ?? []).map(c => c.financierId));
		return all.filter(f => financierIds.has(f.id));
	}, [values.supplierId, financiersData, supplierContracts]);

	// Offers filtered by supplier + financier using nested data from financiersData
	const filteredOffers = useMemo(() => {
		const allOffers = (financierOffersData?.financierOffers ?? []).filter(o => o.status !== "closed");
		if (!values.supplierId && !values.financierId) return allOffers;
		const matchingOfferIds = new Set(
			(financiersData?.financiers ?? [])
				.filter(f => !values.financierId || showAllOffers || f.id === values.financierId)
				.flatMap(f => f.financierSupplierContracts)
				.filter(c => !values.supplierId || c.supplierId === values.supplierId)
				.flatMap(c => c.financierOffers)
				.map(o => o.id),
		);
		return allOffers.filter(o => matchingOfferIds.has(o.id));
	}, [values.supplierId, values.financierId, financiersData, financierOffersData, showAllOffers]);

	const selectedBuyer = buyersData?.buyers.find(buyer => buyer.id === values.buyerId);
	const selectedSupplier = suppliersData?.suppliers.find(supplier => supplier.id === values.supplierId);
	const selectedCollector = collectorsData?.collectors.find(collector => collector.id === values.collectorId);
	const selectedInsurer = insurersData?.insurers.find(insurer => insurer.id === values.insurerId);
	const selectedOffer = financierOffersData?.financierOffers.find(offer => offer.id === values.financialOfferId);

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				setOpen(nextOpen);
				if (!nextOpen) {
					resetForm();
					setBuyerSearch("");
					setSupplierSearch("");
					setShowAllOffers(false);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button size={size}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.sales-orders.add-sales-order")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-auto max-h-[95vh] w-[95vw] overflow-y-auto p-0 sm:w-[85vw] lg:w-[70%]">
				<div className="rounded-md bg-[#EAF4FB] px-4 py-4 sm:px-8">
					<form className="flex flex-col gap-6 sm:gap-8" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<h2 className="text-xl font-bold text-[#313740] sm:text-[26px]">
								{t("admin.sales-orders.add-new-sales-order")}
							</h2>
							<p className="text-sm text-[#606A74] sm:text-[15px]">{t("admin.sales-orders.add-new-sales-order-description")}</p>
						</div>

						<div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-6">
							<Input
								label="Sales Order Number"
								name="invoiceReference"
								placeholder={t("admin.sales-orders.invoice-number-placeholder")}
								type="text"
								error={errors.invoiceReference}
								value={values.invoiceReference || ""}
								onChange={e => setFieldValue("invoiceReference", e.target.value.trim())}
							/>

							{buyerId ? (
								<Input
									label={t("admin.sales-orders.buyer-name")}
									name="buyerName"
									placeholder={t("admin.sales-orders.buyer-name-placeholder")}
									type="text"
									value={selectedBuyer ? `${selectedBuyer.buyerName || ""} (${selectedBuyer.crNumber || ""})` : ""}
									disabled
									readOnly
								/>
							) : (
								<AutoCompleteInput
									isLoading={isBuyersLoading}
									items={
										buyersData?.buyers.map(buyer => ({
											label: `${buyer.buyerName} (${buyer.crNumber})`,
											value: buyer.id,
										})) ?? []
									}
									label={t("admin.sales-orders.buyer-name")}
									placeholder={t("admin.sales-orders.buyer-name-placeholder")}
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
							)}

							<AutoCompleteInput
								isLoading={isSuppliersLoading}
								items={filteredSuppliers.map(supplier => ({
									label: `${supplier.supplierName} (${supplier.crNumber})`,
									value: supplier.id,
								}))}
								label={t("admin.sales-orders.supplier-name")}
								placeholder={t("admin.sales-orders.supplier-name-placeholder")}
								searchValue={supplierSearch}
								selectedValue={values.supplierId}
								onSearchValueChange={setSupplierSearch}
								onSelectedValueChange={value => {
									setFieldValue("supplierId", value);
									setFieldValue("financialOfferId", 0);
									setShowAllOffers(false);
									const financierStillValid = allContracts.some(
										c => c.supplierId === value && c.financierId === values.financierId,
									);
									if (!financierStillValid) setFieldValue("financierId", 0);
								}}
								error={errors.supplierId}
								onClear={() => {
									setFieldValue("supplierId", 0);
									setSupplierSearch("");
									setFieldValue("financierId", 0);
									setFieldValue("financialOfferId", 0);
									setShowAllOffers(false);
								}}
							/>

							<AmountInput
								error={errors.invoiceAmount}
								label={t("admin.sales-orders.invoice-amount")}
								name="invoiceAmount"
								placeholder={t("admin.sales-orders.invoice-amount-placeholder")}
								value={values.invoiceAmount}
								onChange={value => setFieldValue("invoiceAmount", value)}
							/>

							<DateInput
								disableFutureDates
								error={errors.orderDate}
								label={t("admin.sales-orders.invoice-date")}
								placeholder={t("admin.sales-orders.invoice-date-placeholder")}
								value={values.orderDate}
								onChange={date => setFieldValue("orderDate", date)}
							/>
						</div>

						<Separator className="bg-[#D5E1E9]" />

						<div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-6">
							{/* Financier */}
							<div className="flex flex-col gap-1">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-[#313740]">{t("admin.sales-orders.financier")}</span>
									<button
										className="text-xs font-medium text-[#3D7CB5] hover:underline"
										type="button"
										onClick={() => {
											setFieldValue("financierId", 0);
											setFieldValue("financialOfferId", 0);
											setShowAllOffers(true);
										}}
									>
										All
									</button>
								</div>
								<AutoCompleteInput
									items={filteredFinanciers.map(financier => ({
										label: financier.financierName,
										value: financier.id,
									}))}
									placeholder={t("admin.sales-orders.financier-placeholder")}
									searchValue={financierSearch}
									selectedValue={values.financierId || undefined}
									onSearchValueChange={setFinancierSearch}
									onSelectedValueChange={value => {
										setFieldValue("financierId", value ?? 0);
										setFieldValue("financialOfferId", 0);
										setShowAllOffers(false);
									}}
									error={errors.financierId}
									onClear={() => {
										setFieldValue("financierId", 0);
										setFinancierSearch("");
										setFieldValue("financialOfferId", 0);
									}}
								/>
							</div>

							{/* Offer */}
							<div className="flex flex-col gap-1">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-[#313740]">{t("admin.sales-orders.offer")}</span>
									<button
										className="text-xs font-medium text-[#3D7CB5] hover:underline"
										type="button"
										onClick={() => {
											setFieldValue("financialOfferId", 0);
											setShowAllOffers(true);
										}}
									>
										All
									</button>
								</div>
								<AutoCompleteInput
									items={filteredOffers.map(offer => ({
										label: offer.offerName,
										value: offer.id,
									}))}
									placeholder={t("admin.sales-orders.offer-placeholder")}
									searchValue={offerSearch}
									selectedValue={values.financialOfferId || undefined}
									onSearchValueChange={setOfferSearch}
									onSelectedValueChange={value => {
										const offerId = value ?? 0;
										setFieldValue("financialOfferId", offerId);
										if (offerId) {
											const offerData = financierOffersData?.financierOffers.find(o => o.id === offerId);
											const matchingContract = allContracts.find(c => c.id === offerData?.financierSupplierContractsId);
											if (matchingContract) {
												const matchingFinancier = financiersData?.financiers.find(f => f.id === matchingContract.financierId);
												if (matchingFinancier) setFieldValue("financierId", matchingFinancier.id);
												setFieldValue("supplierId", matchingContract.supplierId);
												setShowAllOffers(false);
											}
										}
									}}
									error={errors.financialOfferId}
									onClear={() => {
										setFieldValue("financialOfferId", 0);
										setOfferSearch("");
									}}
								/>
							</div>

							<AutoCompleteInput
								items={(insurersData?.insurers ?? []).map(insurer => ({
									label: insurer.insurerName,
									value: insurer.id,
								}))}
								label={t("admin.sales-orders.insurer")}
								placeholder={t("admin.sales-orders.insurer-placeholder")}
								searchValue={insurerSearch}
								selectedValue={values.insurerId || undefined}
								onSearchValueChange={setInsurerSearch}
								onSelectedValueChange={value => setFieldValue("insurerId", value ?? 0)}
								error={errors.insurerId}
								onClear={() => {
									setFieldValue("insurerId", 0);
									setInsurerSearch("");
								}}
							/>

							<AutoCompleteInput
								items={(collectorsData?.collectors ?? []).map(collector => ({
									label: collector.collectorName,
									value: collector.id,
								}))}
								label={t("admin.sales-orders.collector")}
								placeholder={t("admin.sales-orders.collector-placeholder")}
								searchValue={collectorSearch}
								selectedValue={values.collectorId || undefined}
								onSearchValueChange={setCollectorSearch}
								onSelectedValueChange={value => setFieldValue("collectorId", value ?? 0)}
								error={errors.collectorId}
								onClear={() => {
									setFieldValue("collectorId", 0);
									setCollectorSearch("");
								}}
							/>

							{/* <Select
								label={t("admin.sales-orders.manually-verified")}
								value={values.isManuallyVerified ? "yes" : "no"}
								onValueChange={v => setFieldValue("isManuallyVerified", v === "yes")}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("admin.sales-orders.manually-verified-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="yes">{t("admin.sales-orders.yes")}</SelectItem>
									<SelectItem value="no">{t("admin.sales-orders.no")}</SelectItem>
								</SelectContent>
							</Select> */}
						</div>

						<div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:justify-end">
							<Button
								className="h-11 w-full border border-[#3D434C] bg-white text-[#313740] hover:bg-[#F4F7FA] sm:w-[172px]"
								type="button"
								onClick={() => setOpen(false)}
							>
								{t("admin.common.cancel")}
							</Button>

							<Button
								className="h-11 w-full bg-[#3D434C] font-semibold text-white hover:bg-[#2F343C] sm:w-[172px]"
								loading={isPending}
								type="submit"
							>
								{t("admin.sales-orders.add-sales-order")}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
