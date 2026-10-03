"use client";

import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { useCreateInvoice } from "@/api/endpoints/back-office/invoices/create-invoice.api";
import { useFetchFinancierSupplierContract } from "@/api/endpoints/back-office/suppliers/financier-supplier-contracts/fetch-financier-supplier-contract.api";
import { IFinancierOffer, ISalesOrder } from "@/api/types";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface ConfirmDeliveryPopupProps {
	salesOrder: ISalesOrder & { financierOffer?: IFinancierOffer };
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	triggerLabel?: string;
}

export const ConfirmDeliveryPopup = ({ salesOrder, open: controlledOpen, onOpenChange, triggerLabel }: ConfirmDeliveryPopupProps) => {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setOpen = (val: boolean) => {
		if (controlledOpen === undefined) setInternalOpen(val);
		onOpenChange?.(val);
	};

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const contractId = salesOrder.financierOffer?.financierSupplierContractsId;
	const { data: contractData } = useFetchFinancierSupplierContract(
		{ id: contractId! },
		{ enabled: open && !!contractId },
	);
	const financierId = contractData?.contract?.financierId ?? 0;

	const { mutate, isPending } = useCreateInvoice({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "sales-orders"] });
			queryClient.invalidateQueries({ queryKey: ["back-office", "invoices"] });
			queryClient.invalidateQueries({ queryKey: ["back-office", "buyers", String(salesOrder.buyerId)] });
		},
		onSuccess: () => {
			setOpen(false);
			resetForm();
		},
	});

	const { setFieldValue, values, handleSubmit, errors, resetForm } = useForm<{
		deliveryReference: string;
		deliveryAmount: number;
		deliveryDate: string;
		isFinal: boolean;
	}>({
		initialValues: {
			deliveryAmount: 0,
			deliveryDate: new Date().toISOString().split("T")[0],
			deliveryReference: "",
			isFinal: false,
		},
		onSubmit: values => {
			mutate({
				buyerId: salesOrder.buyerId,
				collectorId: salesOrder.collectorId,
				deliveryAmount: values.deliveryAmount,
				deliveryDate: values.deliveryDate,
				financialOfferId: salesOrder.offerId,
				financierId,
				insurerId: salesOrder.insurerId,
				invoiceAmount: values.deliveryAmount,
				invoiceReference: values.deliveryReference,
				isFinal: values.isFinal,
				orderDate: salesOrder.orderDate || undefined,
				reference: values.deliveryReference,
				salesOrderId: salesOrder.id,
				supplierId: salesOrder.supplierId,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.deliveryReference) {
				errors.deliveryReference = t("admin.sales-orders.validation.delivery-reference-required");
			}

			if (!values.deliveryAmount || values.deliveryAmount <= 0) {
				errors.deliveryAmount = t("admin.sales-orders.validation.positive-delivery-amount");
			}

			if (!values.deliveryDate) {
				errors.deliveryDate = t("admin.sales-orders.validation.delivery-date-required");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<Dialog
			open={open}
			onOpenChange={val => {
				setOpen(val);
				if (!val) {
					resetForm();
				}
			}}
		>
			{controlledOpen === undefined && (
				<DialogTrigger asChild>
					<Button className="h-11 border border-[#3D434C] bg-white text-[#313740] hover:bg-[#F4F7FA]">
						{triggerLabel ?? t("admin.sales-orders.confirm-delivery")}
					</Button>
				</DialogTrigger>
			)}

			<DialogContent className="w-[700px] p-0">
				<div className="rounded-xl bg-[#EAF4FB] p-8">
					<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.sales-orders.confirm-delivery-note")}</h2>
							<p className="text-sm text-gray-500">{t("admin.sales-orders.confirm-delivery-description")}</p>
						</div>

						<div className="flex flex-col gap-4">
							<Input
								error={errors.deliveryReference}
								label={t("admin.sales-orders.delivery-reference")}
								placeholder={t("admin.sales-orders.delivery-reference-placeholder")}
								type="text"
								disabled={isPending}
								value={values.deliveryReference}
								onChange={e => setFieldValue("deliveryReference", e.target.value.trim())}
							/>

							<div className="grid grid-cols-2 gap-4">
								<AmountInput
									error={errors.deliveryAmount}
									label={t("admin.sales-orders.delivery-amount")}
									min={0}
									placeholder={t("admin.sales-orders.delivery-amount-placeholder")}
									disabled={isPending}
									value={values.deliveryAmount}
									onChange={value => setFieldValue("deliveryAmount", value)}
								/>

								<DateInput
									disableFutureDates
									error={errors.deliveryDate}
									label={t("admin.sales-orders.delivery-date")}
									placeholder={t("admin.sales-orders.delivery-date-placeholder")}
									value={values.deliveryDate}
									onChange={date => setFieldValue("deliveryDate", date ? dayjs(date).format("YYYY-MM-DD") : date)}
								/>
							</div>

							<div className="flex items-center gap-2">
								<Checkbox
									id="isFinal"
									checked={values.isFinal}
									onCheckedChange={checked => setFieldValue("isFinal", !!checked)}
								/>
								<label htmlFor="isFinal" className="text-sm text-gray-600">
									{t("admin.sales-orders.final-delivery-checkbox")}
								</label>
							</div>
						</div>

						<div className="flex justify-end gap-3 pt-4">
							<Button
								className="w-[200px] bg-[#969696] hover:bg-[#808080]"
								type="button"
								disabled={isPending}
								variant="outline"
								onClick={() => setOpen(false)}
							>
								{t("admin.common.cancel")}
							</Button>
							<Button className="w-[200px] font-bold" loading={isPending} type="submit">
								{t("admin.sales-orders.confirm-delivery")}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
