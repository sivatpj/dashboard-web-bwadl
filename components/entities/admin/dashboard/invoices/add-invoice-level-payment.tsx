import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useBulkCollectionsPayment } from "@/api/endpoints/back-office/collections/bulk-collections-payment.api";
import { ICollection, IInvoice } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input-txn";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format-currency";

interface AddNewPaymentProps extends IInvoice {
	collections: ICollection[];
}

type PaymentMode = "single" | "bulk";

export const AddNewPayment = (props: AddNewPaymentProps) => {
	const { id, deliveryAmount, calcCollection, invoiceAmount, collections } = props;

	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<PaymentMode>("single");

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const baseAmount = deliveryAmount || invoiceAmount || 0;
	const currentCollections = collections.filter(c => c.isCurrent);
	const paidAmount =
		currentCollections.length > 0
			? currentCollections
					.filter(col => (col.appliedAmount || 0) > 0)
					.reduce((sum, col) => sum + (col.appliedAmount || 0), 0)
			: calcCollection || 0;
	const remainingAmount = Math.max(baseAmount - paidAmount, 0);

	const pendingCollections = currentCollections.filter(col => Math.max((col.amount || 0) - (col.appliedAmount || 0), 0) > 0);
	const remainingInstallments = pendingCollections.length;
	const installmentAmount = pendingCollections.length > 0 ? pendingCollections[0].amount : 0;

	const { mutate, isPending } = useBulkCollectionsPayment(
		{ invoiceId: id },
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
				setOpen(false);
				resetForm();
			},
		},
	);

	const { setFieldValue, values, handleSubmit, errors, resetForm } = useForm<{
		amount: number;
		paymentDate: string;
	}>({
		initialValues: {
			amount: 0,
			paymentDate: new Date().toISOString().split("T")[0],
		},
		onSubmit: values => {
			const submitAmount =
				mode === "single" ? Math.min(installmentAmount || 0, remainingAmount) : values.amount;
			mutate({ amount: submitAmount, appliedAt: values.paymentDate });
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (mode === "bulk") {
				if (!values.amount || values.amount <= 0) {
					errors.amount = t("admin.invoices.bulk-payment-amount-error");
				}

				if (values.amount > remainingAmount) {
					errors.amount = t("admin.invoices.bulk-payment-amount-error");
				}
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	const amountToBePaid = mode === "single"
		? Math.min(installmentAmount || 0, remainingAmount)
		: Math.min(values.amount || 0, remainingAmount);

	return (
		<Dialog
			open={open}
			onOpenChange={val => {
				setOpen(val);
				if (!val) {
					resetForm();
					setMode("single");
				}
			}}
		>
			<DialogTrigger asChild>
				<Button disabled={remainingAmount <= 0}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.invoices.add-new-payment")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-800 w-[1000px] bg-[#F0F8FD] p-0">
				<form onSubmit={handleSubmit}>
					<div className="flex flex-col gap-6 p-8">
						{/* Title */}
						<div>
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.invoices.add-payment")}</h2>
							<p className="text-sm text-gray-500">{t("admin.invoices.add-payment-description")}</p>
						</div>

						{/* Mode Toggle */}
						<div className="flex gap-0">
							<button
								type="button"
								className={`rounded-l-md border px-5 py-2 text-sm font-medium transition-colors ${
									mode === "single"
										? "border-[#404040] bg-[#404040] text-white"
										: "border-gray-200 bg-white text-[#404040]"
								}`}
								onClick={() => { setMode("single"); setFieldValue("amount", 0); }}
							>
								{t("admin.invoices.single-payment")}
							</button>
							<button
								type="button"
								className={`rounded-r-md border px-5 py-2 text-sm font-medium transition-colors ${
									mode === "bulk"
										? "border-[#404040] bg-[#404040] text-white"
										: "border-gray-200 bg-white text-[#404040]"
								}`}
								onClick={() => { setMode("bulk"); setFieldValue("amount", 0); }}
							>
								{t("admin.invoices.bulk-payment")}
							</button>
						</div>

						{/* Content */}
						<div className="flex gap-6">
							{/* Left side - inputs */}
							<div className="flex flex-1 flex-col gap-5 rounded-lg border border-gray-200 p-5">
								<div className="flex w-[520px] flex-col gap-1.5">
									<AmountInput
										disabled={isPending || mode === "single"}
										error={errors.amount}
										label={t("admin.invoices.enter-amount")}
										max={remainingAmount}
										min={0}
										placeholder={t("admin.invoices.enter-amount")}
										value={mode === "single" ? Math.min(installmentAmount || 0, remainingAmount) : values.amount}
										onChange={value => {
											if (mode === "bulk") {
												setFieldValue("amount", value > remainingAmount ? remainingAmount : value);
											}
										}}
									/>
								</div>

								<div className="w-[520px]">
									<DateInput
										disableFutureDates
										label={t("admin.invoices.payment-date")}
										value={values.paymentDate}
										placeholder={t("admin.invoices.payment-date")}
										onChange={date => setFieldValue("paymentDate", date)}
									/>
								</div>

								<div className="flex items-start gap-2 text-sm text-[#2A82BE]">
									<Icon className="mt-0.5 h-4 w-4 shrink-0" name="AlertPayment" />
									<span>
										{mode === "single"
											? t("admin.invoices.single-payment-info-note")
											: t("admin.invoices.payment-info-note")}
									</span>
								</div>
							</div>

							{/* Right side - summary */}
							<div className="flex w-[220px] flex-col gap-3">
								<div className="rounded-lg border border-gray-200 p-4">
									<span className="text-xs text-gray-500">{t("admin.invoices.invoice-remaining-amount")}</span>
									<div className="mt-1 flex items-center gap-1 text-lg font-bold text-[#404040]">
										<Icon className="h-4 w-4" name="Riyal" />
										<span>{formatCurrency(remainingAmount, true)}</span>
									</div>
								</div>

								<div className="rounded-lg border border-gray-200 p-4">
									<span className="text-xs text-gray-500">{t("admin.invoices.remaining-installments")}</span>
									<div className="mt-1 text-lg font-bold text-[#404040]">{remainingInstallments}</div>
								</div>

								<div className="rounded-lg border border-gray-200 p-4">
									<span className="text-xs text-gray-500">{t("admin.invoices.installment-amount")}</span>
									<div className="mt-1 text-lg font-bold text-[#404040]">{formatCurrency(installmentAmount, true)}</div>
								</div>

								{amountToBePaid > 0 && (
									<div className="rounded-lg border border-[#38A06C] bg-[#F0FFF4] p-4">
										<span className="text-xs text-[#38A06C]">{t("admin.invoices.amount-will-be-paid")}</span>
										<div className="mt-1 flex items-center gap-1 text-lg font-bold text-[#38A06C]">
											<Icon className="h-4 w-4" name="Riyal" />
											<span>{formatCurrency(amountToBePaid, true)}</span>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="flex justify-end gap-3 border-t border-gray-200 px-8 py-5">
						<Button
							className="h-10 w-[200px] border border-[#404040] bg-[#969696] text-black hover:bg-[#7f7f7f]"
							disabled={isPending}
							type="button"
							onClick={() => setOpen(false)}
						>
							{t("admin.common.cancel")}
						</Button>
						<Button
							className="h-10 w-[200px] bg-[#404040] font-semibold text-white hover:bg-[#2f2f2f]"
							loading={isPending}
							type="submit"
						>
							{t("admin.invoices.add-payment")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
