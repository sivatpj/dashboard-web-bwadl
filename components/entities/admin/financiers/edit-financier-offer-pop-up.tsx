"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

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
import { useUpdateFinancierOffer } from "@/api/endpoints/back-office/financiers/financier-offers/update-financier-offer.api";
import { IFinancierOffer } from "@/api/types";
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

interface Props {
	offer: IFinancierOffer;
	contractId: number;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	trigger?: React.ReactNode;
}

export const EditFinancierOfferPopUp = ({ offer, contractId, open: controlledOpen, onOpenChange, trigger }: Props) => {
	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [internalOpen, setInternalOpen] = useState(false);
	const [warningMessage, setWarningMessage] = useState<string | null>(null);
	const open = controlledOpen ?? internalOpen;
	const setOpen = (nextOpen: boolean) => {
		setInternalOpen(nextOpen);
		onOpenChange?.(nextOpen);
	};

	const { mutate, isPending } = useUpdateFinancierOffer(
		{ id: offer.id },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				const contractKey = ["back-office", "suppliers", "contracts", contractId] as const;
				queryClient.invalidateQueries({ queryKey: contractKey });
				queryClient.invalidateQueries({ queryKey: ["back-office", "financiers"] });
				queryClient.invalidateQueries({ queryKey: ["back-office", "suppliers"] });
			},
			onSuccess: () => {
				toast({
					description: "Offer updated successfully",
					title: "Success",
				});
				// force-refresh the specific contract details query to update the table immediately
				const contractKey = ["back-office", "suppliers", "contracts", contractId] as const;
				queryClient.invalidateQueries({ queryKey: contractKey });
				queryClient.refetchQueries({ queryKey: contractKey });
				queryClient.invalidateQueries({ queryKey: ["back-office", "financiers"] });
				queryClient.invalidateQueries({ queryKey: ["back-office", "suppliers"] });
				setOpen(false);
				resetForm();
			},
		},
	);

	useEffect(() => {
		if (!open) return;
		setFieldValue("bwadlCancellationFees", offer.bwadlCancellationFees);
		setFieldValue("bwadlShare", offer.bwadlShare);
		setFieldValue("collectorCancellationFees", offer.collectorCancellationFees);
		setFieldValue("collectorShare", offer.collectorShare);
		setFieldValue("deliveryDateOffsetDays", offer.deliveryDateOffsetDays);
		setFieldValue("financierCancellationFees", offer.financierCancellationFees);
		setFieldValue("financierShare", offer.financierShare);
		setFieldValue("financierSupplierContractId", contractId);
		setFieldValue("isPreDeliveryOnly", offer.isPreDeliveryOnly ?? false);
		setFieldValue("paymentDateOffsetDays", offer.paymentDateOffsetDays);
		setFieldValue(
			"postDeliveryFinancierDiscount",
			offer.isPreDeliveryOnly ? offer.postDeliveryFinancierDiscount ?? 0 : 0,
		);
		setFieldValue("financingDateOffsetDays", offer.financingDateOffsetDays);
		setFieldValue("financingDateOffsetFrom", offer.financingDateOffsetFrom);
		setFieldValue("installmentNumber", offer.installmentNumber);
		setFieldValue("insurerCancellationFees", offer.insurerCancellationFees);
		setFieldValue("insurerShare", offer.insurerShare);
		setFieldValue("offerName", offer.offerName);
		setFieldValue("offerUniqueReference", offer.offerUniqueReference);
		setFieldValue("repaymentPeriod", offer.repaymentPeriod);
		setFieldValue("status", offer.status ?? "open");
		setFieldValue("supplierAdvancePercentage", offer.supplierAdvancePercentage);
		setFieldValue("supplierCancellationFees", offer.supplierCancellationFees);
		setFieldValue("supplierShare", offer.supplierShare);
	}, [offer, contractId, open]);

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		financierSupplierContractId: number;
		offerUniqueReference: string;
		offerName?: string;
		financingDateOffsetDays: number;
		paymentDateOffsetDays: number;
		deliveryDateOffsetDays: number;
		financierShare: number;
		supplierShare: number;
		collectorShare: number;
		insurerShare: number;
		bwadlShare: number;
		financierCancellationFees: number;
		supplierCancellationFees: number;
		collectorCancellationFees: number;
		insurerCancellationFees: number;
		bwadlCancellationFees: number;
		repaymentPeriod: number;
		installmentNumber: number;
		financingDateOffsetFrom: "order_date" | "delivery_date";
		supplierAdvancePercentage: number;
		isPreDeliveryOnly: boolean;
		postDeliveryFinancierDiscount: number;
		status: "open" | "closed";
	}>({
		initialValues: {
			bwadlCancellationFees: offer.bwadlCancellationFees,
			bwadlShare: offer.bwadlShare,
			collectorCancellationFees: offer.collectorCancellationFees,
			collectorShare: offer.collectorShare,
			deliveryDateOffsetDays: offer.deliveryDateOffsetDays,
			financierCancellationFees: offer.financierCancellationFees,
			financierShare: offer.financierShare,
			financierSupplierContractId: contractId,
			financingDateOffsetDays: offer.financingDateOffsetDays,
			financingDateOffsetFrom: offer.financingDateOffsetFrom,
			installmentNumber: offer.installmentNumber,
			insurerCancellationFees: offer.insurerCancellationFees,
			insurerShare: offer.insurerShare,
			isPreDeliveryOnly: offer.isPreDeliveryOnly ?? false,
			offerName: offer.offerName,
			offerUniqueReference: offer.offerUniqueReference,
			paymentDateOffsetDays: offer.paymentDateOffsetDays,
			postDeliveryFinancierDiscount: offer.postDeliveryFinancierDiscount ?? 0,
			repaymentPeriod: offer.repaymentPeriod,
			status: offer.status ?? "open",
			supplierAdvancePercentage: offer.supplierAdvancePercentage,
			supplierCancellationFees: offer.supplierCancellationFees,
			supplierShare: offer.supplierShare,
		},
		onSubmit: formValues => {
			const warning = getSupplierAdvanceWarning(formValues);
			if (warning) {
				setWarningMessage(warning);
				return;
			}
			mutate(formValues);
		},
		validate(values) {
			const errors: Record<string, string> = {};
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

	const closingViaOutsideRef = useRef(false);
	useEffect(() => {
		if (typeof document === "undefined") return;
		if (open) {
			document.body.setAttribute("data-ignore-row-active", "");
			return () => document.body.removeAttribute("data-ignore-row-active");
		}
		if (closingViaOutsideRef.current) {
			document.body.setAttribute("data-ignore-row-active", "");
			const t = window.setTimeout(() => {
				document.body.removeAttribute("data-ignore-row-active");
				closingViaOutsideRef.current = false;
			}, 150);
			return () => window.clearTimeout(t);
		}
		document.body.removeAttribute("data-ignore-row-active");
		return () => document.body.removeAttribute("data-ignore-row-active");
	}, [open]);

	const swallowNextBackgroundClick = () => {
		const opts: AddEventListenerOptions = { capture: true, once: true };
		const stop = (ev: Event) => {
			ev.preventDefault();
			ev.stopPropagation();
		};
		document.addEventListener("click", stop, opts);
		document.addEventListener("pointerup", stop, opts);
		document.addEventListener("mousedown", stop, opts);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{controlledOpen === undefined && (
				<DialogTrigger asChild>
					{trigger ?? (
						<Button
							data-ignore-row
							className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent p-0 transition hover:border-blue-600 hover:bg-blue-50"
							variant="ghost"
							type="button"
							onPointerDownCapture={e => e.stopPropagation()}
							onMouseDown={e => e.stopPropagation()}
							onClick={e => {
								e.stopPropagation();
								setOpen(true);
							}}
							onKeyDown={e => {
								if (e.key === "Enter" || e.key === " ") {
									e.stopPropagation();
								}
							}}
						>
							<Icon name="Edit" />
						</Button>
					)}
				</DialogTrigger>
			)}

			<DialogContent
				className="h-[95vh] w-[95vw] overflow-y-auto p-0 sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw]"
				onPointerDownOutside={e => {
					e.preventDefault();
					e.stopPropagation();
					closingViaOutsideRef.current = true;
					swallowNextBackgroundClick();
					setOpen(false);
				}}
			>
				<div className="rounded-md bg-[#EAF4FB] px-4 py-4 sm:px-8">
					<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
						<div className="gap-6">
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.financiers.edit-offer")}</h2>
							<p className="mt-2 text-sm text-gray-600">{t("admin.financiers.add-new-offer-description")}</p>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Input
								error={errors.offerUniqueReference}
								label={t("admin.financiers.offer-unique-reference")}
								placeholder={t("admin.financiers.offer-unique-reference-placeholder")}
								type="text"
								value={values.offerUniqueReference}
								onChange={e => setFieldValue("offerUniqueReference", e.target.value)}
								readOnly
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

							<Select
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
							</Select>

							<div className="col-span-1 grid gap-4 sm:col-span-2 sm:grid-cols-3">
								<Select
									label={t("admin.financiers.financing-date-offset-from")}
									value={values.financingDateOffsetFrom}
									disabled={values.isPreDeliveryOnly}
									onValueChange={v => setFieldValue("financingDateOffsetFrom", v)}
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
									error={errors.deliveryDateOffsetDays}
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
								<Input
									error={errors.repaymentPeriod}
									label={t("admin.financiers.repayment-period")}
									placeholder={t("admin.financiers.repayment-period-placeholder")}
									type="number"
									value={values.repaymentPeriod ?? ""}
									onChange={e => setFieldValue("repaymentPeriod", Number(e.target.value))}
								/>

								<Input
									error={errors.installmentNumber}
									label={t("admin.financiers.installment-number")}
									placeholder={t("admin.financiers.installment-number-placeholder")}
									type="number"
									value={values.installmentNumber ?? ""}
									onChange={e => setFieldValue("installmentNumber", Number(e.target.value))}
								/>

								<Input
									error={errors.supplierAdvancePercentage}
									label={t("admin.financiers.supplier-advance-percentage")}
									placeholder={t("admin.financiers.supplier-advance-percentage-placeholder")}
									type="number"
									min={0}
									max={100}
									value={values.supplierAdvancePercentage ?? ""}
									readOnly
									disabled
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
								onClick={() => {
									resetForm();
									setOpen(false);
								}}
							>
								{t("admin.common.cancel")}
							</Button>
							<Button className="w-[230px] font-bold" loading={isPending} type="submit">
								{t("admin.common.save")}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>

			<Dialog open={!!warningMessage} onOpenChange={o => { if (!o) setWarningMessage(null); }}>
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
