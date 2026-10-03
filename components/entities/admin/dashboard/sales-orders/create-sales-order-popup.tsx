"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateSalesOrder } from "@/api/endpoints/back-office/sales-orders/create-sales-order";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

export const CreateSalesOrderPopup = () => {
	const [open, setOpen] = useState(false);

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useCreateSalesOrder({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "sales-orders"] });
		},
		onSuccess: () => {
			setOpen(false);
			resetForm();
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		invoiceAmount: number;
	}>({
		initialValues: {
			invoiceAmount: Number(),
		},
		onSubmit: values => {
			mutate({ amount: values.invoiceAmount });
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (values.invoiceAmount <= 0) {
				errors.invoiceAmount = t("admin.sales-orders.validation.invoice-amount");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<Dialog
			open={open}
			onOpenChange={value => {
				setOpen(value);
				if (!value) resetForm();
			}}
		>
			<DialogTrigger asChild>
				<Button onClick={() => setOpen(true)}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.sales-orders.add-sales-order")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-auto w-[40%] bg-[#F0F8FD]">
				<form className="flex flex-col gap-8 p-8" onSubmit={handleSubmit}>
					<div>
						<h2 className="text-2xl font-bold text-[#404040]">{t("admin.sales-orders.add-sales-order")}</h2>
					</div>

					<AmountInput
						error={errors.invoiceAmount}
						label={t("admin.sales-orders.invoice-amount")}
						placeholder={t("admin.sales-orders.invoice-amount-placeholder")}
						value={values.invoiceAmount}
						onChange={value => setFieldValue("invoiceAmount", value)}
					/>

					<div className="flex justify-end gap-2">
						<Button
							className="h-12 w-[180px] font-semibold"
							type="button"
							variant="outline"
							onClick={() => {
								resetForm();
								setOpen(false);
							}}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button className="h-12 w-[180px] font-semibold" loading={isPending} type="submit">
							{t("admin.sales-orders.add-sales-order")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
