"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateBuyerFinancierLimit } from "@/api/endpoints/back-office/buyers/create-buyer-financier-limit.api";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { AmountInput } from "@/components/ui/amount-input";
import { AutoCompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface BuyerFinancierLimitCreatePopUpProps {
	buyerId: number;
	/** Financier ids that already have a limit for this buyer, so they can be excluded from the picker. */
	excludeFinancierIds: number[];
	trigger: React.ReactNode;
}

export const BuyerFinancierLimitCreatePopUp = (props: BuyerFinancierLimitCreatePopUpProps) => {
	const { buyerId, excludeFinancierIds, trigger } = props;

	const [open, setOpen] = useState(false);
	const [financierSearch, setFinancierSearch] = useState("");

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { data: financiersData } = useFetchFinanciers({ q: financierSearch });

	const { mutate, isPending } = useCreateBuyerFinancierLimit(
		{ id: buyerId },
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
				resetForm();
			},
		},
	);

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		financierId?: number;
		creditLimit?: number;
		repaymentPeriod?: number;
		installmentNumber?: number;
		setAndUseLimit: boolean;
	}>({
		initialValues: {
			creditLimit: undefined,
			financierId: undefined,
			installmentNumber: undefined,
			repaymentPeriod: undefined,
			setAndUseLimit: true,
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
				creditLimit: values.creditLimit as number,
				financierId: values.financierId as number,
				installmentNumber: values.installmentNumber,
				repaymentPeriod: values.repaymentPeriod,
				setAndUseLimit: values.setAndUseLimit,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.financierId) {
				errors.financierId = "Financier is required";
			}
			if (values.creditLimit === undefined || values.creditLimit <= 0) {
				errors.creditLimit = "Credit limit must be a positive amount";
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	const availableFinanciers = (financiersData?.financiers ?? []).filter(
		financier => !excludeFinancierIds.includes(financier.id),
	);

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
						<h2 className="text-2xl font-bold text-[#404040]">Create Buyer Financier Limit</h2>
					</div>

					<div className="grid min-h-0 flex-1 grid-cols-1 gap-x-10 gap-y-5 overflow-y-auto pr-2">
						<AutoCompleteInput
							items={availableFinanciers.map(financier => ({
								label: financier.facilityName || financier.financierName,
								value: financier.id,
							}))}
							error={errors.financierId}
							label="Financier"
							placeholder="Select financier"
							searchValue={financierSearch}
							selectedValue={values.financierId}
							onClear={() => {
								setFieldValue("financierId", undefined);
								setFinancierSearch("");
							}}
							onSearchValueChange={setFinancierSearch}
							onSelectedValueChange={value => setFieldValue("financierId", value)}
						/>

						<AmountInput
							error={errors.creditLimit}
							label="Credit Limit"
							placeholder="Enter credit limit"
							value={values.creditLimit}
							onChange={value => setFieldValue("creditLimit", value)}
						/>

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

						<Button
							className="w-full px-16 font-semibold sm:w-auto"
							disabled={isPending || !values.financierId || !values.creditLimit}
							type="submit"
						>
							Create
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
