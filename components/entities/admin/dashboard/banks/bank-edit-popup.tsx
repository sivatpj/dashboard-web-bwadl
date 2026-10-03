import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useUpdateBankEntity } from "@/api/endpoints/back-office/banks/update-bank-entity.api";
import { IBankEntity } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface FormValues {
	bankName: string;
	shortName: string;
	address: string;
	accountHolderName: string;
	accountNumber: string;
	iban: string;
}

interface BankEditPopUpProps {
	bank: IBankEntity;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function BankEditPopUp(props: BankEditPopUpProps) {
	const { bank, open, onOpenChange } = props;

	const { t } = useTranslationContext();
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { mutate, isPending } = useUpdateBankEntity(
		{ id: bank.id },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: ["back-office", "bank-entities"] });
			},
			onSuccess: () => {
				onOpenChange(false);
			},
		},
	);

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<FormValues>({
		initialValues: {
			accountHolderName: bank.accountHolderName || "",
			accountNumber: bank.accountNumber || "",
			address: bank.address || "",
			bankName: bank.bankName,
			iban: bank.iban || "",
			shortName: bank.shortName,
		},
		onSubmit: values => {
			mutate({
				accountHolderName: values.accountHolderName.trim() || undefined,
				accountNumber: values.accountNumber.trim() || undefined,
				address: values.address.trim() || undefined,
				bankName: values.bankName.trim(),
				iban: values.iban.trim() || undefined,
				shortName: values.shortName.trim(),
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.bankName.trim()) {
				errors.bankName = t("admin.banks.validation.bank-name");
			}

			if (!values.shortName.trim()) {
				errors.shortName = t("admin.banks.validation.short-name");
			}

			if (values.accountNumber.trim() && !/^\d+$/.test(values.accountNumber.trim())) {
				errors.accountNumber = t("admin.banks.validation.account-number");
			}

			if (!values.accountNumber.trim() && !values.iban.trim()) {
				errors.accountNumber = t("admin.banks.validation.account-number-or-iban");
				errors.iban = t("admin.banks.validation.account-number-or-iban");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	useEffect(() => {
		if (open) {
			resetForm({
				values: {
					accountHolderName: bank.accountHolderName || "",
					accountNumber: bank.accountNumber || "",
					address: bank.address || "",
					bankName: bank.bankName,
					iban: bank.iban || "",
					shortName: bank.shortName,
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, bank.id]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="h-auto w-[80%] bg-[#F0F8FD]">
				<form className="flex h-full w-full flex-col" onSubmit={handleSubmit}>
					<div className="relative mb-6">
						<h2 className="text-2xl font-bold">{t("admin.banks.edit-bank")}</h2>
						<p className="text-muted-foreground">{t("admin.banks.edit-bank-description")}</p>
					</div>

					<div className="flex-1">
						<div className="grid grid-cols-2 gap-x-8 gap-y-4">
							<Input
								className="mt-1"
								disabled
								label={t("admin.banks.account-code")}
								value={bank.accountCode}
							/>

							<Input
								className="mt-1"
								error={errors.bankName}
								label={t("admin.banks.bank-name")}
								placeholder={t("admin.banks.bank-name-placeholder")}
								required
								value={values.bankName}
								onChange={e => setFieldValue("bankName", e.target.value)}
							/>

							<Input
								className="mt-1"
								error={errors.shortName}
								label={t("admin.banks.short-name")}
								placeholder={t("admin.banks.short-name-placeholder")}
								required
								value={values.shortName}
								onChange={e => setFieldValue("shortName", e.target.value)}
							/>

							<Input
								className="mt-1"
								label={t("admin.banks.address")}
								placeholder={t("admin.banks.address-placeholder")}
								value={values.address}
								onChange={e => setFieldValue("address", e.target.value)}
							/>

							<Input
								className="mt-1"
								label={t("admin.banks.account-holder-name")}
								placeholder={t("admin.banks.account-holder-name-placeholder")}
								value={values.accountHolderName}
								onChange={e => setFieldValue("accountHolderName", e.target.value)}
							/>

							<Input
								className="mt-1"
								error={errors.accountNumber}
								label={t("admin.banks.account-number")}
								placeholder={t("admin.banks.account-number-placeholder")}
								value={values.accountNumber}
								onChange={e => setFieldValue("accountNumber", e.target.value.replace(/[^\d]/g, ""))}
							/>

							<Input
								className="mt-1"
								error={errors.iban}
								label={t("admin.banks.iban")}
								placeholder={t("admin.banks.iban-placeholder")}
								value={values.iban}
								onChange={e => setFieldValue("iban", e.target.value.toUpperCase())}
							/>
						</div>
					</div>

					<div className="mt-auto flex justify-end gap-4 pt-6">
						<Button
							className="w-[230px] bg-[#969696] hover:bg-[#969696]"
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button className="w-[230px] font-bold" loading={isPending} type="submit">
							{t("admin.banks.save-changes")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
