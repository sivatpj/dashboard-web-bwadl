"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateFinancierOffer } from "@/api/endpoints/back-office/financiers/financier-offers/create-financier-offer.api";
import { IFinancierSupplierContract } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";
import { OfferCard } from "./offer-card";

function getSupplierAdvanceWarning(values: {
	isPreDeliveryOnly: boolean;
	supplierAdvancePercentage: number;
	financingDateOffsetFrom: "order_date" | "delivery_date";
}): string | null {
	if (values.isPreDeliveryOnly) {
		if (values.supplierAdvancePercentage !== 100) {
			return "For pre-delivery only, Supplier Advance % must be 100";
		}
		if (values.financingDateOffsetFrom !== "order_date") {
			return "For pre-delivery only, Offset From must be Order Date";
		}
	}
	return null;
}

interface AddNewOfferPopupProps {
	financierId?: number;
	supplierId?: number;
	contracts: IFinancierSupplierContract[];
}

export const AddNewOfferPopup = (props: AddNewOfferPopupProps) => {
	const { financierId, supplierId, contracts } = props;

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [warningMessage, setWarningMessage] = useState<string | null>(null);

	const { mutate, isPending } = useCreateFinancierOffer({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			if (supplierId) {
				queryClient.invalidateQueries({ queryKey: ["back-office", "suppliers", String(supplierId)] });
			} else if (financierId) {
				queryClient.invalidateQueries({ queryKey: ["back-office", "financiers", String(financierId)] });
			}
		},
		onSuccess: () => {
			setOpen(false);
			resetForm();
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		financierSupplierContractId: number;
		offerName: string;
		offerUniqueReference: string;
		financingDateOffsetDays: number;
		paymentDateOffsetDays: number;
		deliveryDateOffsetDays: number;
		financierShare: number;
		supplierShare: number;
		insurerShare: number;
		collectorShare: number;
		bwadlShare: number;
		supplierAdvancePercentage: number;
		repaymentPeriod: number;
		installmentNumber: number;
		financingDateOffsetFrom: "order_date" | "delivery_date";
		isPreDeliveryOnly: boolean;
		postDeliveryFinancierDiscount: number;
		status: "open" | "closed";
		financierCancellationFees: number;
		supplierCancellationFees: number;
		collectorCancellationFees: number;
		insurerCancellationFees: number;
		bwadlCancellationFees: number;
	}>({
		initialValues: {
			bwadlCancellationFees: 0,
			bwadlShare: 0,
			collectorCancellationFees: 0,
			collectorShare: 0,
			deliveryDateOffsetDays: 0,
			financierCancellationFees: 0,
			financierShare: 0,
			financierSupplierContractId: contracts.length === 1 ? contracts[0].id : 0,
			financingDateOffsetDays: 0,
			financingDateOffsetFrom: "order_date",
			installmentNumber: 0,
			insurerCancellationFees: 0,
			insurerShare: 0,
			isPreDeliveryOnly: false,
			offerName: "",
			offerUniqueReference: "",
			paymentDateOffsetDays: 0,
			postDeliveryFinancierDiscount: 0,
			repaymentPeriod: 0,
			status: "open",
			supplierAdvancePercentage: 100,
			supplierCancellationFees: 0,
			supplierShare: 0,
		},
		onSubmit: formValues => {
			const warning = getSupplierAdvanceWarning(formValues);
			if (warning) {
				setWarningMessage(warning);
				return;
			}
			mutate({
				bwadlCancellationFees: formValues.bwadlCancellationFees,
				bwadlShare: formValues.bwadlShare,
				collectorCancellationFees: formValues.collectorCancellationFees,
				collectorShare: formValues.collectorShare,
				deliveryDateOffsetDays: formValues.deliveryDateOffsetDays,
				financierCancellationFees: formValues.financierCancellationFees,
				financierShare: formValues.financierShare,
				financierSupplierContractId: formValues.financierSupplierContractId,
				financingDateOffsetDays: formValues.financingDateOffsetDays,
				financingDateOffsetFrom: formValues.financingDateOffsetFrom,
				installmentNumber: formValues.installmentNumber,
				insurerCancellationFees: formValues.insurerCancellationFees,
				insurerShare: formValues.insurerShare,
				isPreDeliveryOnly: formValues.isPreDeliveryOnly,
				offerName: formValues.offerName || undefined,
				offerUniqueReference: formValues.offerUniqueReference,
				paymentDateOffsetDays: formValues.paymentDateOffsetDays,
				postDeliveryFinancierDiscount: formValues.postDeliveryFinancierDiscount,
				repaymentPeriod: formValues.repaymentPeriod,
				status: formValues.status,
				supplierAdvancePercentage: formValues.supplierAdvancePercentage,
				supplierCancellationFees: formValues.supplierCancellationFees,
				supplierShare: formValues.supplierShare,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.financierSupplierContractId) {
				errors.financierSupplierContractId = t("admin.suppliers.validation.financier-name");
			}
			if (!values.offerUniqueReference) {
				errors.offerUniqueReference = t("admin.financiers.offer-unique-reference-required-error");
			}
			if (values.financingDateOffsetDays < 0) {
				errors.financingDateOffsetDays = t("admin.financiers.validation.financing-date-offset");
			}
			if (values.paymentDateOffsetDays < 0) {
				errors.paymentDateOffsetDays = t("admin.financiers.validation.payment-date-offset");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				setOpen(nextOpen);
				if (!nextOpen) resetForm();
			}}
		>
			<DialogTrigger asChild>
				<Button size="sm" onClick={() => setOpen(true)}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.financiers.add-new-offer")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-[95vh] w-[95vw] overflow-y-auto p-0 sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw]">
				<div className="rounded-md bg-[#EAF4FB] px-4 py-4 sm:px-8">
					<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
						<div className="gap-6">
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.financiers.add-new-offer")}</h2>
							<p className="mt-2 text-sm text-gray-600">{t("admin.financiers.add-new-offer-description")}</p>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Select
								label={t("admin.financiers.contract-name")}
								value={String(values.financierSupplierContractId)}
								onValueChange={v => setFieldValue("financierSupplierContractId", +v)}
							>
								<SelectTrigger error={errors.financierSupplierContractId}>
									<SelectValue placeholder={t("admin.financiers.offer-name-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									{contracts.map(contract => (
										<SelectItem key={contract.id} value={String(contract.id)}>
											{contract.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Input
								error={errors.offerUniqueReference}
								label={t("admin.financiers.offer-unique-reference")}
								placeholder={t("admin.financiers.offer-unique-reference-placeholder")}
								type="text"
								value={values.offerUniqueReference}
								onChange={e => setFieldValue("offerUniqueReference", e.target.value)}
							/>

							<Input
								error={errors.offerName}
								label={t("admin.financiers.offer-name")}
								placeholder={t("admin.financiers.offer-name-placeholder")}
								type="text"
								value={values.offerName}
								onChange={e => setFieldValue("offerName", e.target.value)}
							/>

							<div className="col-span-1 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:col-span-2">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<Select
										label={t("admin.financiers.is-pre-delivery-only")}
										value={String(values.isPreDeliveryOnly)}
										onValueChange={v => {
											const isPreDeliveryOnly = v === "true";
											setFieldValue("isPreDeliveryOnly", isPreDeliveryOnly);
											if (isPreDeliveryOnly) {
												setFieldValue("financingDateOffsetFrom", "order_date");
											} else {
												setFieldValue("postDeliveryFinancierDiscount", 0);
											}
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("admin.financiers.is-pre-delivery-only-placeholder")} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="true">{t("admin.financiers.is-pre-delivery-only-yes")}</SelectItem>
											<SelectItem value="false">{t("admin.financiers.is-pre-delivery-only-no")}</SelectItem>
										</SelectContent>
									</Select>

									<AmountInput
										key={String(values.isPreDeliveryOnly)}
										decimals={2}
										icon="%"
										iconPosition="right"
										label={t("admin.financiers.post-delivery-financier-discount")}
										max={100}
										min={0}
										placeholder={t("admin.financiers.post-delivery-financier-discount-placeholder")}
										readOnly={!values.isPreDeliveryOnly}
										value={values.postDeliveryFinancierDiscount}
										onChange={value => setFieldValue("postDeliveryFinancierDiscount", value)}
									/>

									<AmountInput
										decimals={0}
										error={errors.paymentDateOffsetDays}
										icon={null}
										label={t("admin.financiers.payment-date-offset")}
										max={9999}
										min={0}
										placeholder={t("admin.financiers.payment-date-offset-placeholder")}
										value={values.paymentDateOffsetDays}
										onChange={value => setFieldValue("paymentDateOffsetDays", value)}
									/>
								</div>
							</div>

							{/* <Select
								label={t("admin.financiers.status")}
								value={values.status}
								onValueChange={v => setFieldValue("status", v as "open" | "closed")}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("admin.financiers.status")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="open">{t("admin.financiers.status-open")}</SelectItem>
									<SelectItem value="closed">{t("admin.financiers.status-closed")}</SelectItem>
								</SelectContent>
							</Select> */}

							<div className="col-span-1 grid gap-4 sm:col-span-2 sm:grid-cols-3">
								<Select
									label={t("admin.financiers.financing-date-offset-from")}
									value={values.financingDateOffsetFrom}
									disabled={values.isPreDeliveryOnly}
									onValueChange={v => setFieldValue("financingDateOffsetFrom", v as "order_date" | "delivery_date")}
								>
									<SelectTrigger error={errors.financingDateOffsetFrom}>
										<SelectValue placeholder={t("admin.financiers.financing-date-offset-from-placeholder")} />
									</SelectTrigger>

									<SelectContent>
										<SelectItem value="order_date">{t("admin.financiers.order-date")}</SelectItem>
										<SelectItem value="delivery_date">{t("admin.financiers.delivery-date")}</SelectItem>
									</SelectContent>
								</Select>

								<AmountInput
									decimals={0}
									error={errors.financingDateOffsetDays}
									icon={null}
									label={t("admin.financiers.financing-date-offset")}
									max={9999}
									min={0}
									placeholder={t("admin.financiers.financing-date-offset-placeholder")}
									value={values.financingDateOffsetDays}
									onChange={value => setFieldValue("financingDateOffsetDays", value)}
								/>

								<AmountInput
									decimals={0}
									icon={null}
									label={t("admin.financiers.delivery-date-offset")}
									max={9999}
									min={0}
									placeholder={t("admin.financiers.delivery-date-offset-placeholder")}
									value={values.deliveryDateOffsetDays}
									onChange={value => setFieldValue("deliveryDateOffsetDays", value)}
								/>
							</div>

							<div className="col-span-1 grid gap-4 sm:col-span-2 sm:grid-cols-3">
								<AmountInput
									decimals={0}
									label={t("admin.financiers.repayment-period")}
									max={9999}
									min={0}
									placeholder={t("admin.financiers.repayment-period-placeholder")}
									value={values.repaymentPeriod}
									onChange={value => setFieldValue("repaymentPeriod", value)}
								/>

								<AmountInput
									decimals={0}
									label={t("admin.financiers.installment-number")}
									max={9999}
									min={0}
									placeholder={t("admin.financiers.installment-number-placeholder")}
									value={values.installmentNumber}
									onChange={value => setFieldValue("installmentNumber", value)}
								/>

								<AmountInput
									decimals={2}
									error={errors.supplierAdvancePercentage}
									icon="%"
									iconPosition="right"
									label={t("admin.financiers.supplier-advance-percentage")}
									max={100}
									min={0}
									placeholder={t("admin.financiers.supplier-advance-percentage-placeholder")}
									value={values.supplierAdvancePercentage}
									readOnly
									disabled
									onChange={value => setFieldValue("supplierAdvancePercentage", value)}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<OfferCard
								entity={t("admin.financiers.offers.entities.financier")}
								share={{
									error: errors.financierShare,
									onChange: value => setFieldValue("financierShare", value),
									value: values.financierShare,
								}}
								cancellationFees={{
									error: errors.financierCancellationFees,
									onChange: value => setFieldValue("financierCancellationFees", value),
									value: values.financierCancellationFees,
								}}
							/>

							<OfferCard
								entity={t("admin.financiers.offers.entities.supplier")}
								share={{
									error: errors.supplierShare,
									onChange: value => setFieldValue("supplierShare", value),
									value: values.supplierShare,
								}}
								cancellationFees={{
									error: errors.supplierCancellationFees,
									onChange: value => setFieldValue("supplierCancellationFees", value),
									value: values.supplierCancellationFees,
								}}
							/>

							<OfferCard
								entity={t("admin.financiers.offers.entities.insurer")}
								share={{
									error: errors.insurerShare,
									onChange: value => setFieldValue("insurerShare", value),
									value: values.insurerShare,
								}}
								cancellationFees={{
									error: errors.insurerCancellationFees,
									onChange: value => setFieldValue("insurerCancellationFees", value),
									value: values.insurerCancellationFees,
								}}
							/>

							<OfferCard
								entity={t("admin.financiers.offers.entities.collector")}
								share={{
									error: errors.collectorShare,
									onChange: value => setFieldValue("collectorShare", value),
									value: values.collectorShare,
								}}
								cancellationFees={{
									error: errors.collectorCancellationFees,
									onChange: value => setFieldValue("collectorCancellationFees", value),
									value: values.collectorCancellationFees,
								}}
							/>

							<OfferCard
								entity={t("admin.financiers.offers.entities.bwadl")}
								share={{
									error: errors.bwadlShare,
									onChange: value => setFieldValue("bwadlShare", value),
									value: values.bwadlShare,
								}}
								cancellationFees={{
									error: errors.bwadlCancellationFees,
									onChange: value => setFieldValue("bwadlCancellationFees", value),
									value: values.bwadlCancellationFees,
								}}
							/>
						</div>

						<div className="flex justify-end gap-3 pt-8">
							<Button
								className="w-[230px] bg-[#969696] hover:bg-[#969696]"
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								{t("admin.common.cancel")}
							</Button>
							<Button className="w-[230px] font-bold" loading={isPending} type="submit">
								{t("admin.financiers.add-offer")}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>

			<Dialog open={!!warningMessage} onOpenChange={open => { if (!open) setWarningMessage(null); }}>
				<DialogContent className="max-w-sm">
					<div className="flex flex-col gap-4 p-2">
						<p className="text-sm text-gray-800">{warningMessage}</p>
						<div className="flex justify-end">
							<Button type="button" onClick={() => setWarningMessage(null)}>
								OK
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</Dialog>
	);
};
