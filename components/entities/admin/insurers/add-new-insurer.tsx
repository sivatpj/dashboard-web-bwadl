import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateInsurer } from "@/api/endpoints/back-office/insurers/create-insurer.api";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { CrNumberInput } from "@/components/ui/cr-number-input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MobileInput } from "@/components/ui/mobile-input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface AddNewInsurerProps {}

export const AddNewInsurer = (props: AddNewInsurerProps) => {
	const { t } = useTranslationContext();

	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { mutate, isPending } = useCreateInsurer({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "insurers"] });
		},
		onSuccess: () => {
			setOpen(false);
			resetForm();
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		crNumber: number;
		facilityName: string;
		insurerName: string;
		additionalInfo?: any;
	}>({
		initialValues: {
			additionalInfo: {},
			crNumber: Number(),
			facilityName: String(),
			insurerName: String(),
		},
		onSubmit: values => {
			mutate(values);
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (values.crNumber?.toString().length !== 10) {
				errors.crNumber = t("admin.insurers.validation.cr-number");
			}

			if (!values.facilityName) {
				errors.facilityName = t("admin.insurers.validation.facility-name");
			}

			if (!values.insurerName) {
				errors.insurerName = t("admin.insurers.validation.insurer-name");
			}

			const isPositiveNumber = (v: string) => {
				const n = Number(v);
				return !Number.isNaN(n) && n >= 0;
			};

			if (values.additionalInfo?.financialShare && !isPositiveNumber(values.additionalInfo.financialShare)) {
				errors["additionalInfo.financialShare"] = t("admin.insurers.validation.financial-share");
			}

			if (values.additionalInfo?.accountingFees && !isPositiveNumber(values.additionalInfo.accountingFees)) {
				errors["additionalInfo.accountingFees"] = t("admin.insurers.validation.accounting-fees");
			}

			if (
				values.additionalInfo?.accountingCancellationFees &&
				!isPositiveNumber(values.additionalInfo.accountingCancellationFees)
			) {
				errors["additionalInfo.accountingCancellationFees"] = t(
					"admin.insurers.validation.accounting-cancellation-fees",
				);
			}

			if (
				values.additionalInfo?.email &&
				!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.additionalInfo.email)
			) {
				errors["additionalInfo.email"] = t("admin.insurers.validation.email");
			}

			if (values.additionalInfo?.phone && !/^05\d{8}$/.test(values.additionalInfo.phone)) {
				errors["additionalInfo.phone"] = t("admin.insurers.validation.phone");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	const additionalInfoErrors = errors as Record<string, string | undefined>;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-48">
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.insurers.add-new-insurer")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-auto w-[70%] rounded-xl p-0">
				<div className="rounded-md bg-[#EAF4FB] p-8">
					<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
						<div className="gap-6">
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.insurers.add-new-insurer")}</h2>
							<p className="text-sm text-gray-600">{t("admin.insurers.add-new-insurer-description")}</p>
						</div>

						<div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
							<CrNumberInput
								error={errors.crNumber}
								label={t("admin.insurers.cr-number")}
								name="crNumber"
								placeholder={t("admin.insurers.cr-number-placeholder")}
								value={values.crNumber}
								onChange={value => setFieldValue("crNumber", value)}
							/>

							<Input
								error={errors.facilityName}
								label={t("admin.insurers.facility-name")}
								name="facilityName"
								placeholder={t("admin.insurers.facility-name-placeholder")}
								type="text"
								value={values.facilityName}
								onChange={e => setFieldValue("facilityName", e.target.value)}
							/>

							<Input
								error={errors.insurerName}
								label={t("admin.insurers.insurer-name")}
								name="insurerName"
								placeholder={t("admin.insurers.insurer-name-placeholder")}
								type="text"
								value={values.insurerName}
								onChange={e => setFieldValue("insurerName", e.target.value)}
							/>

							<Input
								error={additionalInfoErrors["additionalInfo.financialShare"]}
								label={t("admin.insurers.financial-share")}
								min={0}
								name="financialShare"
								placeholder={t("admin.insurers.financial-share-placeholder")}
								step="any"
								type="number"
								value={values.additionalInfo?.financialShare || ""}
								onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
								onChange={e =>
									setFieldValue("additionalInfo", { ...values.additionalInfo, financialShare: e.target.value })
								}
							/>

							<Input
								error={additionalInfoErrors["additionalInfo.accountingFees"]}
								label={t("admin.insurers.accounting-fees")}
								min={0}
								name="accountingFees"
								placeholder={t("admin.insurers.accounting-fees-placeholder")}
								step="any"
								type="number"
								value={values.additionalInfo?.accountingFees || ""}
								onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
								onChange={e =>
									setFieldValue("additionalInfo", { ...values.additionalInfo, accountingFees: e.target.value })
								}
							/>

							<Input
								error={additionalInfoErrors["additionalInfo.accountingCancellationFees"]}
								label={t("admin.insurers.accounting-cancellation-fees")}
								min={0}
								name="accountingCancellationFees"
								placeholder={t("admin.insurers.accounting-cancellation-fees-placeholder")}
								step="any"
								type="number"
								value={values.additionalInfo?.accountingCancellationFees || ""}
								onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
								onChange={e =>
									setFieldValue("additionalInfo", {
										...values.additionalInfo,
										accountingCancellationFees: e.target.value,
									})
								}
							/>

							<Input
								error={additionalInfoErrors["additionalInfo.email"]}
								label={t("admin.insurers.email-address")}
								name="email"
								placeholder={t("admin.insurers.email-address-placeholder")}
								type="text"
								value={values.additionalInfo?.email || ""}
								onChange={e => setFieldValue("additionalInfo", { ...values.additionalInfo, email: e.target.value })}
							/>

							<MobileInput
								error={additionalInfoErrors["additionalInfo.phone"]}
								label={t("admin.insurers.phone-number")}
								name="phoneNumber"
								placeholder={t("admin.insurers.phone-number-placeholder")}
								value={values.additionalInfo?.phone || ""}
								onChange={e => setFieldValue("additionalInfo", { ...values.additionalInfo, phone: e.target.value })}
							/>
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
								{t("admin.insurers.add-insurer")}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
