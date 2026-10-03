"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useFetchSalesOrders } from "@/api/endpoints/back-office/sales-orders/fetch-sales-orders";
import { useAxios } from "@/api/hooks/axios";
import { IBuyer } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input-txn";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format-currency";

interface AddBuyerPaymentProps {
	buyer: IBuyer;
}

export const AddBuyerPayment = ({ buyer }: AddBuyerPaymentProps) => {
	const [open, setOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const client = useAxios();

	const { data: salesOrdersCountData, isLoading: isLoadingSalesOrdersCount } = useFetchSalesOrders({
		buyerId: buyer.id,
		limit: 1,
	});
	const hasSalesOrders = (salesOrdersCountData?.totalCount ?? 0) > 0;

	const { data: salesOrdersData, isLoading: isLoadingSalesOrders } = useFetchSalesOrders(
		{ buyerId: buyer.id, limit: 10000 },
		{ enabled: hasSalesOrders },
	);

	const totalOutstanding = (salesOrdersData?.salesOrders || [])
		.filter(so => !so.offer?.isPreDeliveryOnly)
		.reduce((sum, so) => sum + Number(so.calcOutstanding || 0), 0);

	// const activeSalesOrdersCount = (salesOrdersData?.salesOrders || []).filter(so => !so.isClosed).length;

	const { setFieldValue, values, handleSubmit, errors, resetForm } = useForm<{
		amount: number;
		paymentDate: string;
		useCashAccountBalance: boolean;
	}>({
		initialValues: {
			amount: 0,
			paymentDate: new Date().toISOString().split("T")[0],
			useCashAccountBalance: false,
		},
		onSubmit: async values => {
			setIsPending(true);
			try {
				const { data } = await client.post(`/backoffice/collections/${buyer.id}/buyer-bulk-payment`, {
					amount: values.useCashAccountBalance ? undefined : values.amount,
					appliedAt: values.paymentDate,
					useCashAccountBalance: values.useCashAccountBalance,
				});

				queryClient.invalidateQueries({ queryKey: ["back-office", "buyers", String(buyer.id)] });
				queryClient.invalidateQueries({ queryKey: ["back-office", "sales-orders"] });
				queryClient.invalidateQueries({ queryKey: ["back-office", "invoices"] });
				queryClient.invalidateQueries({ queryKey: ["back-office", "collections"] });

				if (data?.message) {
					toast({
						description: data.message,
						title: t("admin.common.error"),
						variant: "destructive",
					});
				}

				setOpen(false);
				resetForm();
			} catch (err: any) {
				toast({
					description: err.response?.data?.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			} finally {
				setIsPending(false);
			}
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.useCashAccountBalance) {
				if (!values.amount || values.amount <= 0) {
					errors.amount = t("admin.invoices.bulk-payment-amount-error");
				} else if (values.amount > totalOutstanding) {
					errors.amount = t("admin.invoices.bulk-payment-amount-error");
				}
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	const amountToBePaid = Math.min(values.amount || 0, totalOutstanding);

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
			<DialogTrigger asChild>
				<Button disabled={isLoadingSalesOrdersCount || isLoadingSalesOrders || !hasSalesOrders || totalOutstanding <= 0}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.buyers.add-payment")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-800 w-[1000px] bg-[#F0F8FD] p-0">
				<form onSubmit={handleSubmit}>
					<div className="flex flex-col gap-6 p-8">
						<div>
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.buyers.add-payment")}</h2>
							<p className="text-sm text-gray-500">{t("admin.buyers.add-payment-description")}</p>
						</div>

						<div className="flex gap-6">
							{/* Left side - inputs */}
							<div className="flex flex-1 flex-col gap-5 rounded-lg border border-gray-200 p-5">
								<AmountInput
									disabled={isPending || values.useCashAccountBalance}
									error={errors.amount}
									label={t("admin.invoices.enter-amount")}
									max={totalOutstanding}
									min={0}
									placeholder={t("admin.invoices.enter-amount")}
									value={values.useCashAccountBalance ? 0 : values.amount}
									onChange={val => setFieldValue("amount", val > totalOutstanding ? totalOutstanding : val)}
								/>

								<DateInput
									disableFutureDates
									label={t("admin.invoices.payment-date")}
									placeholder={t("admin.invoices.payment-date")}
									value={values.paymentDate}
									onChange={date => setFieldValue("paymentDate", date)}
								/>

							{/* 	<label className="flex cursor-pointer items-center gap-2 text-sm text-[#404040]">
									<input
										checked={values.useCashAccountBalance}
										className="h-4 w-4 cursor-pointer accent-[#404040]"
										type="checkbox"
										onChange={e => {
											setFieldValue("useCashAccountBalance", e.target.checked);
											if (e.target.checked) setFieldValue("amount", 0);
										}}
									/>
									{t("admin.buyers.use-cash-balance")}
								</label> */}

								<div className="flex items-start gap-2 text-sm text-[#2A82BE]">
									<Icon className="mt-0.5 h-4 w-4 shrink-0" name="AlertPayment" />
									<span>{t("admin.buyers.buyer-payment-info-note")}</span>
								</div>
							</div>

							{/* Right side - summary */}
							<div className="flex w-[220px] flex-col gap-3">
								<div className="rounded-lg border border-gray-200 p-4">
									<span className="text-xs text-gray-500">{t("admin.buyers.total-outstanding")}</span>
									<div className="mt-1 flex items-center gap-1 text-lg font-bold text-[#404040]">
										<Icon className="h-4 w-4" name="Riyal" />
										<span>{formatCurrency(totalOutstanding, true)}</span>
									</div>
								</div>

								{/* <div className="rounded-lg border border-gray-200 p-4">
									<span className="text-xs text-gray-500">{t("admin.buyers.active-sales-orders")}</span>
									<div className="mt-1 text-lg font-bold text-[#404040]">{activeSalesOrdersCount}</div>
								</div> */}

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
							{t("admin.buyers.add-payment")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
