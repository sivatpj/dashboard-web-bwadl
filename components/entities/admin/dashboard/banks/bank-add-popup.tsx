import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateBankEntity } from "@/api/endpoints/back-office/banks/create-bank-entity.api";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface FormValues {
	bankCode: string;
	bankName: string;
	shortName: string;
	address: string;
	accountHolderName: string;
	accountNumber: string;
	iban: string;
}

const initialValues: FormValues = {
	accountHolderName: "",
	accountNumber: "",
	address: "",
	bankCode: "",
	bankName: "",
	iban: "",
	shortName: "",
};

export function BankAddPopUp() {
	const { t } = useTranslationContext();

	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();

	const { toast } = useToast();

	const { mutate, isPending } = useCreateBankEntity({
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
			setOpen(false);
			resetForm();
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<FormValues>({
		initialValues,
		onSubmit: values => {
			mutate({
				accountHolderName: values.accountHolderName.trim() || undefined,
				accountNumber: values.accountNumber.trim() || undefined,
				address: values.address.trim() || undefined,
				bankCode: values.bankCode.trim(),
				bankName: values.bankName.trim(),
				iban: values.iban.trim() || undefined,
				shortName: values.shortName.trim(),
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.bankCode.trim() || !/^[A-Za-z0-9]+$/.test(values.bankCode.trim())) {
				errors.bankCode = t("admin.banks.validation.bank-code");
			}

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

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				setOpen(next);
				if (!next) resetForm();
			}}
		>
			<DialogTrigger asChild>
				<Button className="w-48" onClick={() => setOpen(true)}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.banks.add-new-bank")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-auto w-[80%] bg-[#F0F8FD]">
				<form className="flex h-full w-full flex-col" onSubmit={handleSubmit}>
					<div className="relative mb-6">
						<h2 className="text-2xl font-bold">{t("admin.banks.add-new-bank")}</h2>
						<p className="text-muted-foreground">{t("admin.banks.add-new-bank-description")}</p>
					</div>

					<div className="flex-1">
						<div className="grid grid-cols-2 gap-x-8 gap-y-4">
							<Input
								className="mt-1"
								error={errors.bankCode}
								label={t("admin.banks.bank-code")}
								placeholder={t("admin.banks.bank-code-placeholder")}
								required
								value={values.bankCode}
								onChange={e => setFieldValue("bankCode", e.target.value.replace(/\s+/g, ""))}
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
							onClick={() => setOpen(false)}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button className="w-[230px] font-bold" loading={isPending} type="submit">
							{t("admin.banks.add-bank")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
