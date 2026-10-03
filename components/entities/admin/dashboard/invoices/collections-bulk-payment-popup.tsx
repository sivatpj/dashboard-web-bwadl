import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useBulkCollectionsPayment } from "@/api/endpoints/back-office/collections/bulk-collections-payment.api";
import { ICollection, IInvoice } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface CollectionsBulkPaymentPopUpProps extends IInvoice {
	collections?: ICollection[];
}

export const CollectionsBulkPaymentPopUp = (props: CollectionsBulkPaymentPopUpProps) => {
	const { id, calcCollection, invoiceAmount, deliveryAmount, collections = [] } = props;
	const baseAmount = deliveryAmount || invoiceAmount || 0;
	const paidAmount =
		collections.length > 0
			? collections.reduce((sum, collection) => sum + (collection.appliedAmount || 0), 0)
			: calcCollection || 0;
	const remainingAmount = Math.max(baseAmount - paidAmount, 0);

	const [open, setOpen] = useState(false);

	const { t } = useTranslationContext();
	const { toast } = useToast();

	const queryClient = useQueryClient();

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
	}>({
		initialValues: {
			amount: 0,
		},
		onSubmit: values => {
			mutate(values);
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.amount || values.amount <= 0) {
				errors.amount = t("admin.invoices.bulk-payment-amount-error");
			}

			if (values.amount > remainingAmount) {
				errors.amount = t("admin.invoices.bulk-payment-amount-error");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button disabled={remainingAmount <= 0} size="sm">
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.invoices.bulk-pay")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-auto w-[70%] bg-[#EAF4FB] p-0">
				<form className="p-8" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-6">
						<div className="gap-6">
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.invoices.bulk-pay")}</h2>
							<p className="text-sm text-gray-600">{t("admin.invoices.bulk-pay-description")}</p>
						</div>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<AmountInput
								disabled={isPending}
								error={errors.amount}
								label={t("admin.invoices.bulk-payment-amount")}
								max={remainingAmount}
								min={0}
								placeholder={t("admin.invoices.bulk-payment-amount-description")}
								value={values.amount}
								onChange={value => setFieldValue("amount", value > remainingAmount ? remainingAmount : value)}
							/>
						</div>

						<div className="flex justify-end gap-3 pt-8">
							<Button
								className="h-10 w-[20%] rounded-md border border-[#404040] bg-white px-6 text-gray-800 hover:bg-white"
								loading={isPending}
								type="button"
								onClick={() => setOpen(false)}
							>
								{t("admin.common.cancel")}
							</Button>

							<Button
								className="h-10 w-[20%] rounded-md bg-[#404040] px-6 text-white hover:bg-[#2f2f2f]"
								loading={isPending}
								type="submit"
							>
								{t("admin.invoices.bulk-pay")}
							</Button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
