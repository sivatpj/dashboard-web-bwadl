import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateFinancierOffer } from "@/api/endpoints/back-office/financiers/financier-offers/create-financier-offer.api";
import { IFinancierSupplierContract, IInvoice } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";
import { EditContract } from "../dashboard/suppliers/edit-contract";
import { OfferCard } from "./offer-card";

interface AddNewFinancierOfferProps {
	contract: IFinancierSupplierContract & {
		invoices: IInvoice[];
	};
}

export const AddNewFinancierOffer = (props: AddNewFinancierOfferProps) => {
	const { contract } = props;

	const { t } = useTranslationContext();

	const [open, setOpen] = useState(false);

	const { toast } = useToast();

	const queryClient = useQueryClient();

	const { mutate, isPending } = useCreateFinancierOffer({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["back-office", "suppliers", "contracts"],
			});
		},
		onSuccess: () => {
			setOpen(false);
			resetForm();
		},
	});

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
	}>({
		initialValues: {
			bwadlCancellationFees: Number(),
			bwadlShare: Number(),
			collectorCancellationFees: Number(),
			collectorShare: Number(),
			deliveryDateOffsetDays: Number(),
			paymentDateOffsetDays: Number(),
			financierCancellationFees: Number(),
			financierShare: Number(),
			financierSupplierContractId: contract.id,
			financingDateOffsetDays: Number(),
			financingDateOffsetFrom: "order_date",
			installmentNumber: Number(),
			insurerCancellationFees: Number(),
			insurerShare: Number(),
			isPreDeliveryOnly: false,
			offerName: String(),
			offerUniqueReference: String(),
			postDeliveryFinancierDiscount: Number(),
			repaymentPeriod: Number(),
			supplierAdvancePercentage: Number(),
			supplierCancellationFees: Number(),
			supplierShare: Number(),
		},
		onSubmit: values => {
			mutate(values);
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.offerUniqueReference) {
				errors.offerUniqueReference = t("admin.financiers.offer-unique-reference-required-error");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<div className="flex gap-4">
				<EditContract {...contract} />

				<DialogTrigger asChild>
					<Button size="sm" onClick={() => setOpen(true)}>
						<Icon className="h-4 w-4 fill-white" name="PlusBox" />
						{t("admin.financiers.add-new-offer")}
					</Button>
				</DialogTrigger>
			</div>

			<DialogContent className="h-auto w-[70%] p-0">
				<div className="rounded-md bg-[#EAF4FB] px-8 py-4">
					<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
						<div className="gap-6">
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.financiers.add-new-offer")}</h2>
							<p className="text-sm text-gray-600">{t("admin.financiers.add-new-offer-description")}</p>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

							<div className="grid col-span-2 gap-4 sm:grid-cols-3">
								<Select
									label={t("admin.financiers.financing-date-offset-from")}
									value={values.financingDateOffsetFrom}
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

								<Input
									error={errors.financingDateOffsetDays}
									label={t("admin.financiers.financing-date-offset")}
									placeholder={t("admin.financiers.financing-date-offset-placeholder")}
									type="number"
									value={values.financingDateOffsetDays || ""}
									step={1}
								onKeyDown={e => [".", "e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
								onChange={e => setFieldValue("financingDateOffsetDays", Number(e.target.value))}
								/>

								<Input
									error={errors.deliveryDateOffsetDays}
									label={t("admin.financiers.delivery-date-offset")}
									placeholder={t("admin.financiers.delivery-date-offset-placeholder")}
									type="number"
									value={values.deliveryDateOffsetDays || ""}
									step={1}
								onKeyDown={e => [".", "e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
								onChange={e => setFieldValue("deliveryDateOffsetDays", Number(e.target.value))}
								/>
							</div>

							<div className="grid col-span-2 gap-4 sm:grid-cols-3">
								<Input
									error={errors.repaymentPeriod}
									label={t("admin.financiers.repayment-period")}
									placeholder={t("admin.financiers.repayment-period-placeholder")}
									type="number"
									value={values.repaymentPeriod || ""}
									step={1}
								onKeyDown={e => [".", "e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
								onChange={e => setFieldValue("repaymentPeriod", Number(e.target.value))}
								/>

								<Input
									error={errors.installmentNumber}
									label={t("admin.financiers.installment-number")}
									placeholder={t("admin.financiers.installment-number-placeholder")}
									type="number"
									value={values.installmentNumber || ""}
									step={1}
								onKeyDown={e => [".", "e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
								onChange={e => setFieldValue("installmentNumber", Number(e.target.value))}
								/>

								<Input
									error={errors.supplierAdvancePercentage}
									label={t("admin.financiers.supplier-advance-percentage")}
									max={100}
									min={0}
									placeholder={t("admin.financiers.supplier-advance-percentage-placeholder")}
									step="any"
									type="number"
									value={values.supplierAdvancePercentage || ""}
									onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
									onChange={e => {
										const val = Number(e.target.value);
										if ((val >= 0 && val <= 100) || e.target.value === "") {
											setFieldValue("supplierAdvancePercentage", val);
										}
									}}
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
								{t("admin.suppliers.add-contract")}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
