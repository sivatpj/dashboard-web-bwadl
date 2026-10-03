"use client";

import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useUpdateSalesOrder } from "@/api/endpoints/back-office/sales-orders/update-sales-order.api";
import { ISalesOrder, IInvoice } from "@/api/types";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface EditSalesOrderPopupProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	salesOrder: ISalesOrder | null;
	invoices?: IInvoice[];
}

export const EditSalesOrderPopup = ({ open, onOpenChange, salesOrder, invoices = [] }: EditSalesOrderPopupProps) => {
	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const totalAmountInvoiced = invoices.reduce((acc, invoice) => acc + (invoice.deliveryAmount || 0), 0);
	const wasClosed = Boolean(salesOrder?.isClosed);

	const { mutate, isPending } = useUpdateSalesOrder(
		{ id: salesOrder?.id || 0 },
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
		amount: number;
		reference: string;
		orderDate?: string;
		isClosed: boolean;
		isManuallyVerified: boolean;
		orderType: "contract" | "order";
	}>({
		initialValues: {
			amount: 0,
			isClosed: false,
			isManuallyVerified: false,
			orderDate: undefined,
			orderType: "order",
			reference: "",
		},
		onSubmit: values => {
			if (!salesOrder) return;
			mutate({
				amount: values.amount,
				isClosed: values.isClosed,
				isManuallyVerified: values.isManuallyVerified,
				orderDate: values.orderDate ? dayjs(values.orderDate).format("YYYY-MM-DD") : undefined,
				orderType: values.orderType,
				reference: values.reference,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};
			if (!values.reference) errors.reference = t("admin.sales-orders.validation.invoice-number");
			if (!values.amount || values.amount <= 0) errors.amount = t("admin.sales-orders.validation.invoice-amount");

			if (totalAmountInvoiced === 0 && wasClosed && !values.isClosed) {
				errors.isClosed = t("admin.sales-orders.validation.closure-cannot-be-reverted");
			}
			if (totalAmountInvoiced > 0 && !wasClosed && values.isClosed) {
				errors.isClosed = t("admin.sales-orders.validation.active-invoices-close-blocked");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	useEffect(() => {
		if (!salesOrder || !open) return;
		setFieldValue("amount", salesOrder.amount || 0);
		setFieldValue("reference", salesOrder.reference || "");
		setFieldValue("orderDate", salesOrder.orderDate || undefined);
		setFieldValue("isClosed", Boolean(salesOrder.isClosed));
		setFieldValue("isManuallyVerified", Boolean(salesOrder.isManuallyVerified));
		setFieldValue("orderType", salesOrder.orderType === "contract" ? "contract" : "order");
	}, [salesOrder, open]);

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
						<h2 className="text-2xl font-bold text-gray-900">{t("admin.sales-orders.change-sales-order")}</h2>
					</div>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<Input
							error={errors.reference}
							label={t("admin.sales-orders.order-number")}
							value={values.reference}
							onChange={event => setFieldValue("reference", event.target.value)}
						/>
						<AmountInput
							error={errors.amount}
							label={t("admin.sales-orders.order-amount")}
							value={values.amount}
							onChange={value => setFieldValue("amount", value)}
						/>
						<DateInput
							label={t("admin.sales-orders.order-date")}
							value={values.orderDate}
							onChange={date => setFieldValue("orderDate", date)}
						/>
						<Select
							label={t("admin.sales-orders.order-type")}
							value={values.orderType}
							onValueChange={value => setFieldValue("orderType", value as "contract" | "order")}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="order">{t("admin.sales-orders.order-type-order")}</SelectItem>
								<SelectItem value="contract">{t("admin.sales-orders.order-type-contract")}</SelectItem>
							</SelectContent>
						</Select>
						<div className="flex flex-col gap-1">
							<Select
								label={t("admin.sales-orders.closed")}
								value={values.isClosed ? "yes" : "no"}
								onValueChange={value => setFieldValue("isClosed", value === "yes")}
							>
								<SelectTrigger error={errors.isClosed}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="no">{t("admin.sales-orders.no")}</SelectItem>
									<SelectItem value="yes">{t("admin.sales-orders.yes")}</SelectItem>
								</SelectContent>
							</Select>
							{totalAmountInvoiced > 0 && wasClosed && !values.isClosed && (
								<p className="text-xs text-amber-600">{t("admin.sales-orders.revert-closure-warning")}</p>
							)}
						</div>
						<Select
							label={t("admin.sales-orders.manually-verified")}
							value={values.isManuallyVerified ? "yes" : "no"}
							onValueChange={value => setFieldValue("isManuallyVerified", value === "yes")}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="no">{t("admin.sales-orders.no")}</SelectItem>
								<SelectItem value="yes">{t("admin.sales-orders.yes")}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end gap-3">
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							{t("admin.common.cancel")}
						</Button>
						<Button loading={isPending} type="submit">
							{t("admin.common.save")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
