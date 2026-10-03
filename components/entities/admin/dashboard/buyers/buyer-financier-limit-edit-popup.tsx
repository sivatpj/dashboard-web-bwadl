"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useUpdateBuyerFinancierLimit } from "@/api/endpoints/back-office/buyers/update-buyer-financier-limit.api";
import { IBuyerFinancierLimit } from "@/api/types";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface BuyerFinancierLimitEditPopUpProps {
	buyerId: number;
	financierLimit: IBuyerFinancierLimit;
	trigger: React.ReactNode;
}

export const BuyerFinancierLimitEditPopUp = (props: BuyerFinancierLimitEditPopUpProps) => {
	const { buyerId, financierLimit, trigger } = props;

	const [open, setOpen] = useState(false);

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useUpdateBuyerFinancierLimit(
		{ financierId: financierLimit.financierId, id: buyerId },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["back-office", "buyers", String(buyerId), "financier-limits"] });
				setOpen(false);
			},
		},
	);

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		creditLimit?: number;
		repaymentPeriod?: number;
		installmentNumber?: number;
		setAndUseLimit: boolean;
	}>({
		initialValues: {
			creditLimit: financierLimit.creditLimit,
			installmentNumber: financierLimit.installmentNumber,
			repaymentPeriod: financierLimit.repaymentPeriod,
			setAndUseLimit: financierLimit.setAndUseLimit,
		},
		onSubmit: values => {
			const hasRepaymentPeriod = !!values.repaymentPeriod;
			const hasInstallmentNumber = !!values.installmentNumber;
			if (hasRepaymentPeriod !== hasInstallmentNumber) {
				toast({
					description: t("admin.buyers.validation.repayment-installments-together"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
				return;
			}

			mutate({
				creditLimit: values.creditLimit,
				installmentNumber: values.installmentNumber,
				repaymentPeriod: values.repaymentPeriod,
				setAndUseLimit: values.setAndUseLimit,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (values.creditLimit === undefined || values.creditLimit < 0) {
				errors.creditLimit = "Credit limit must be a positive amount";
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
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent className="flex max-h-[calc(100vh-2rem)] w-[min(90vw,600px)] flex-col bg-[#F0F8FD] p-0">
				<form className="flex min-h-0 w-full flex-col gap-6 p-6 sm:p-8" onSubmit={handleSubmit}>
					<div className="shrink-0">
						<h2 className="text-2xl font-bold text-[#404040]">Edit Buyer Financier Limit</h2>
						<p className="text-sm text-[#7A93A2]">{financierLimit.financierName}</p>
					</div>

					<div className="grid min-h-0 flex-1 grid-cols-1 gap-x-10 gap-y-5 overflow-y-auto pr-2">
						<AmountInput
							error={errors.creditLimit}
							label="Credit Limit"
							placeholder="Enter credit limit"
							value={values.creditLimit}
							onChange={value => setFieldValue("creditLimit", value)}
						/>

						<Input disabled label="Available Limit" readOnly value={financierLimit.availableLimit} />

						<Input
							icon={t("admin.buyers.days")}
							label="Repayment Period"
							min={0}
							placeholder="Enter repayment period"
							type="number"
							value={values.repaymentPeriod === 0 ? "" : values.repaymentPeriod}
							onChange={e => setFieldValue("repaymentPeriod", Number(e.target.value))}
						/>

						<Input
							label="Number of Installments"
							min={0}
							placeholder="Enter number of installments"
							type="number"
							value={values.installmentNumber === 0 ? "" : values.installmentNumber}
							onChange={e => setFieldValue("installmentNumber", Number(e.target.value))}
						/>

						<label className="flex items-center gap-2 text-sm font-medium text-[#404040]">
							<Checkbox
								checked={values.setAndUseLimit}
								onCheckedChange={checked => setFieldValue("setAndUseLimit", checked === true)}
							/>
							{t("admin.buyers.set-and-use-limit")}
						</label>
					</div>

					<div className="flex shrink-0 flex-col justify-end gap-2 border-t border-[#D5E1E9] pt-4 sm:flex-row">
						<Button
							className="w-full px-16 font-semibold sm:w-auto"
							type="button"
							variant="outline"
							onClick={() => {
								resetForm();
								setOpen(false);
							}}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button className="w-full px-16 font-semibold sm:w-auto" disabled={isPending} type="submit">
							{t("admin.common.save")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
