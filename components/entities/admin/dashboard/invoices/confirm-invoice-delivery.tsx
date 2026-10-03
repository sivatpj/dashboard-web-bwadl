"use client";

import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { useUpdateInvoice } from "@/api/endpoints/back-office/invoices/update-invoice.api";
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
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface ConfirmInvoiceDeliveryProps extends IInvoice {
	buyer: IBuyer;
	supplier: ISupplier;
	collections: ICollection[];
	insurer: IInsurer;
	collector: ICollector;
	financierOffer: IFinancierOffer;
	financierSupplierContract: IFinancierSupplierContract;
	onConfirmed?: () => void;
}

export const ConfirmInvoiceDelivery = (props: ConfirmInvoiceDeliveryProps) => {
	const { id, invoiceAmount, invoiceReference, orderDate, financierOffer, onConfirmed } = props;
	const [open, setOpen] = useState(false);

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useUpdateInvoice(
		{ id },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: ["back-office", "invoices"] });
				queryClient.invalidateQueries({ queryKey: ["back-office", "invoices", String(id)] });
				queryClient.invalidateQueries({ queryKey: ["back-office", "sales-orders"] });
			},
			onSuccess: () => {
				queryClient.refetchQueries({ queryKey: ["back-office", "invoices", String(id)], type: "active" });
				setOpen(false);
				resetForm();
				onConfirmed?.();
			},
		},
	);

	const { values, setFieldValue, errors, handleSubmit, resetForm } = useForm<{
		deliveryReference: string;
		deliveryAmount: number;
		deliveryDate: string;
		isFinal: boolean;
	}>({
		initialValues: {
			deliveryAmount: invoiceAmount || 0,
			deliveryDate: dayjs().toISOString(),
			deliveryReference: invoiceReference || "",
			isFinal: false,
		},
		onSubmit: values => {
			const deliveryDate = `${dayjs(values.deliveryDate).format("YYYY-MM-DD")}T00:00:00.000Z`;
			const financingDate =
				financierOffer.financingDateOffsetFrom === "delivery_date"
					? dayjs(deliveryDate)
							.add(financierOffer.financingDateOffsetDays ?? 0, "day")
							.toISOString()
					: dayjs(orderDate || deliveryDate)
							.add(financierOffer.financingDateOffsetDays ?? 0, "day")
							.toISOString();
			const settlementDate = dayjs(deliveryDate)
				.add(financierOffer.repaymentPeriod ?? 0, "day")
				.toISOString();

			mutate({
				deliveryAmount: values.deliveryAmount,
				deliveryDate,
				financingDate,
				invoiceReference: values.deliveryReference,
				isFinal: values.isFinal,
				settlementDate,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.deliveryAmount || values.deliveryAmount <= 0) {
				errors.deliveryAmount = t("admin.invoices.validation.positive-delivery-amount");
			}

			if (!values.deliveryReference) {
				errors.deliveryReference = t("admin.sales-orders.validation.delivery-reference-required");
			}

			if (!values.deliveryDate) {
				errors.deliveryDate = t("admin.invoices.validation.delivery-date-required");
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
				if (!val) resetForm();
			}}
		>
			<DialogTrigger asChild>
				<Button className="h-11 border border-[#3D434C] bg-white text-[#313740] hover:bg-[#F4F7FA]">
					{t("admin.sales-orders.confirm-delivery")}
				</Button>
			</DialogTrigger>

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
								onChange={event => setFieldValue("deliveryReference", event.target.value)}
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
									onChange={date => setFieldValue("deliveryDate", date)}
								/>
							</div>

							<div className="flex items-center gap-2">
								<Checkbox
									id={`invoice-${id}-isFinal`}
									checked={values.isFinal}
									onCheckedChange={checked => setFieldValue("isFinal", !!checked)}
								/>
								<label htmlFor={`invoice-${id}-isFinal`} className="text-sm text-gray-600">
									{t("admin.invoices.final-delivery-checkbox")}
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
