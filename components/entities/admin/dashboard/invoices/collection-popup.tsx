import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePersistCollection } from "@/api/endpoints/back-office/collections/persist-collection.api";
import { ICollection } from "@/api/types";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface CollectionPopUpProps {
	collection: ICollection | null;
	setCollection: (collection: ICollection | null) => void;
}

export const CollectionPopUp = (props: CollectionPopUpProps) => {
	const { collection, setCollection } = props;

	const open = !!collection;

	const { t } = useTranslationContext();

	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { mutate, isPending } = usePersistCollection(
		{
			id: collection?.id,
		},
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
				setCollection(null);
			},
		},
	);

	const { setFieldValue, values, handleSubmit, errors, resetForm } = useForm<{
		appliedAmount?: number;
		subAdjustments?: string;
		reason?: string;
		terminalId?: string;
	}>({
		initialValues: {
			appliedAmount: collection?.appliedAmount || 0,
			reason: collection?.reason || "",
			subAdjustments: collection?.subAdjustments || "",
			terminalId: collection?.terminalId || "",
		},
		onSubmit: values => {
			mutate(values);
		},
		validate(values) {
			const errors: Record<string, string> = {};

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	useEffect(() => {
		if (collection) {
			setFieldValue("appliedAmount", collection.appliedAmount || 0);
			setFieldValue("subAdjustments", collection.subAdjustments || "");
			setFieldValue("reason", collection.reason || "");
			setFieldValue("terminalId", collection.terminalId || "");
		}
	}, [collection]);

	return (
		<Dialog
			open={open}
			onOpenChange={() => {
				setCollection(null);
				resetForm();
			}}
		>
			<DialogContent className="h-auto w-[70%] bg-[#EAF4FB] p-0">
				<form className="p-8" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-6">
						<div className="gap-6">
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.invoices.modify-collection")}</h2>
							<p className="text-sm text-gray-600">{t("admin.invoices.modify-collection-description")}</p>
						</div>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<AmountInput
								disabled={isPending}
								error={errors.appliedAmount}
								label={t("admin.invoices.paid-amount")}
								max={collection ? collection.amount : undefined}
								placeholder={t("admin.invoices.paid-amount-placeholder")}
								value={values.appliedAmount}
								onChange={value => setFieldValue("appliedAmount", value)}
							/>
							<AmountInput
								disabled={isPending}
								label={t("admin.invoices.remaining-amount")}
								placeholder={t("admin.invoices.remaining-amount-placeholder")}
								value={collection ? collection.amount - (values.appliedAmount || 0) : 0}
								readOnly
							/>
							<Input
								disabled={isPending}
								label={t("admin.invoices.sub-adjustment")}
								placeholder={t("admin.invoices.sub-adjustment-placeholder")}
								type="text"
								value={values.subAdjustments}
								onChange={e => setFieldValue("subAdjustments", e.target.value)}
							/>

							{/* // TODO: These fields cause a new collection as a result of the versioning system. */}
							{/* <Input
								disabled={isPending}
								label={t("admin.invoices.reason")}
								placeholder={t("admin.invoices.reason-placeholder")}
								type="text"
								value={values.reason}
								onChange={e => setFieldValue("reason", e.target.value)}
							/>
							<Input
								disabled={isPending}
								label={t("admin.invoices.terminal-id")}
								placeholder={t("admin.invoices.terminal-id-placeholder")}
								type="text"
								value={values.terminalId}
								onChange={e => setFieldValue("terminalId", e.target.value)}
							/> */}
						</div>

						<div className="flex justify-end gap-3 pt-8">
							<Button
								className="h-10 w-[20%] rounded-md border border-[#404040] bg-white px-6 text-gray-800 hover:bg-white"
								loading={isPending}
								type="button"
								onClick={() => setCollection(null)}
							>
								{t("admin.common.cancel")}
							</Button>

							<Button
								className="h-10 w-[20%] rounded-md bg-[#404040] px-6 text-white hover:bg-[#2f2f2f]"
								loading={isPending}
								type="submit"
							>
								{t("admin.invoices.modify-collection")}
							</Button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
