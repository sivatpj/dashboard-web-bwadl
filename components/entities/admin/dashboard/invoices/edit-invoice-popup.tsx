"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useUpdateInvoice } from "@/api/endpoints/back-office/invoices/update-invoice.api";
import { IInvoice } from "@/api/types";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface EditInvoicePopupProps {
	invoice: IInvoice | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	viewOnly?: boolean;
	showFinalCheckbox?: boolean;
}

export const EditInvoicePopup = ({ invoice, open, onOpenChange, viewOnly, showFinalCheckbox }: EditInvoicePopupProps) => {
	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useUpdateInvoice(
		{ id: invoice?.id || 0 },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: ["back-office"] });
			},
			onSuccess: () => {
				onOpenChange(false);
			},
		},
	);

	const { values, setFieldValue, handleSubmit, errors, resetForm } = useForm<{
		invoiceAmount: number;
		isFinal: boolean;
	}>({
		initialValues: {
			invoiceAmount: 0,
			isFinal: false,
		},
		onSubmit: values => {
			if (!invoice) return;
			mutate({
				amount: values.invoiceAmount,
				deliveryAmount: values.invoiceAmount,
				invoiceAmount: values.invoiceAmount,
				isFinal: values.isFinal,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};
			if (!values.invoiceAmount || values.invoiceAmount <= 0) {
				errors.invoiceAmount = t("admin.invoices.validation.invoice-amount");
			}
			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	useEffect(() => {
		if (!invoice || !open) return;
		setFieldValue("invoiceAmount", invoice.invoiceAmount || 0);
		setFieldValue("isFinal", invoice.isFinal ?? false);
	}, [invoice, open]);

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				onOpenChange(nextOpen);
				if (!nextOpen) resetForm();
			}}
		>
			<DialogContent className="h-auto w-[70%] bg-[#EAF4FB] p-0">
				<form className="flex flex-col gap-6 p-8" onSubmit={handleSubmit}>
					<div>
						<h2 className="text-2xl font-bold text-gray-900">{t("admin.invoices.change-invoice")}</h2>
					</div>

					<div className="grid grid-cols-1 gap-6">
						<AmountInput
							error={errors.invoiceAmount}
							label={t("admin.invoices.invoice-amount")}
							value={values.invoiceAmount}
							onChange={value => setFieldValue("invoiceAmount", value)}
							disabled={viewOnly || (invoice?.calcPaidAmount || 0) > 0}
						/>
						{showFinalCheckbox && (
							<div className="flex items-center gap-3">
								<Checkbox
									id="isFinal"
									checked={values.isFinal}
									onCheckedChange={checked => setFieldValue("isFinal", Boolean(checked))}
								/>
								<label htmlFor="isFinal" className="cursor-pointer text-sm font-medium text-gray-700">
									{t("admin.invoices.is-final")}
								</label>
							</div>
						)}
					</div>

					<div className="flex justify-end gap-3">
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							{viewOnly ? t("admin.common.close") : t("admin.common.cancel")}
						</Button>
						{(!viewOnly || showFinalCheckbox) && (
							<Button loading={isPending} type="submit">
								{t("admin.common.save")}
							</Button>
						)}
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
