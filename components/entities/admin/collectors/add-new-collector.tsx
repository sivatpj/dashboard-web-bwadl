import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateCollector } from "@/api/endpoints/back-office/collectors/create-collector.api";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { CrNumberInput } from "@/components/ui/cr-number-input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MobileInput } from "@/components/ui/mobile-input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface AddNewCollectorProps {
	isEditing?: boolean;
}

export const AddNewCollector = ({}: AddNewCollectorProps) => {
	const { t } = useTranslationContext();

	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { mutate, isPending } = useCreateCollector({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "collectors"] });
		},
		onSuccess: () => {
			setOpen(false);
			resetForm();
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		crNumber: number;
		facilityName: string;
		collectorName: string;
		additionalInfo?: any;
		allowsOverdraft?: boolean;
	}>({
		initialValues: {
			additionalInfo: {},
			allowsOverdraft: true,
			collectorName: String(),
			crNumber: Number(),
			facilityName: String(),
		},
		onSubmit: values => {
			const payload: any = {
				additionalInfo: values.additionalInfo,
				allowsOverdraft: values.allowsOverdraft === true,
				collectorName: values.collectorName,
				crNumber: values.crNumber,
				facilityName: values.facilityName,
			};
			mutate(payload);
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (values.crNumber?.toString().length !== 10) {
				errors.crNumber = t("admin.collectors.validation.cr-number");
			}
			if (!values.facilityName) {
				errors.facilityName = t("admin.collectors.validation.facility-name");
			}
			if (!values.collectorName) {
				errors.collectorName = t("admin.collectors.validation.collector-name");
			}
			const isPositiveNumber = (v: string) => {
				const n = Number(v);
				return !Number.isNaN(n) && n >= 0;
			};

			if (!values.additionalInfo?.accountingFees) {
				errors["additionalInfo.accountingFees"] = t("admin.collectors.validation.accounting-fees");
			} else if (!isPositiveNumber(values.additionalInfo.accountingFees)) {
				errors["additionalInfo.accountingFees"] = t("admin.collectors.validation.accounting-fees");
			}

			if (!values.additionalInfo?.accountingCancellationFees) {
				errors["additionalInfo.accountingCancellationFees"] = t(
					"admin.collectors.validation.accounting-cancellation-fees",
				);
			} else if (!isPositiveNumber(values.additionalInfo.accountingCancellationFees)) {
				errors["additionalInfo.accountingCancellationFees"] = t(
					"admin.collectors.validation.accounting-cancellation-fees",
				);
			}

			if (
				values.additionalInfo?.email_address &&
				!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.additionalInfo.email_address)
			) {
				errors["additionalInfo.email_address"] = t("admin.collectors.validation.email");
			}

			if (
				values.additionalInfo?.contact_number &&
				!/^05\d{8}$/.test(values.additionalInfo.contact_number)
			) {
				errors["additionalInfo.contact_number"] = t("admin.collectors.validation.contact-number");
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
				<Button className="w-48" onClick={() => setOpen(true)}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.collectors.add-new-collector")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-auto w-[70%] p-0">
				<form className="rounded-md bg-[#EAF4FB] p-8" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-6">
						<div className="gap-6">
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.collectors.add-new-collector")}</h2>
							<p className="text-sm text-gray-600">{t("admin.collectors.form-description")}</p>
						</div>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<CrNumberInput
								error={errors.crNumber}
								label={t("admin.collectors.cr-number")}
								placeholder={t("admin.collectors.cr-number-placeholder")}
								value={values.crNumber}
								onChange={value => setFieldValue("crNumber", value)}
							/>
							<Input
								error={errors.facilityName}
								label={t("admin.collectors.facility-name")}
								placeholder={t("admin.collectors.facility-name-placeholder")}
								type="text"
								value={values.facilityName}
								onChange={e => setFieldValue("facilityName", e.target.value)}
							/>
							<Input
								error={errors.collectorName}
								label={t("admin.collectors.collector-name")}
								placeholder={t("admin.collectors.collector-name-placeholder")}
								type="text"
								value={values.collectorName}
								onChange={e => setFieldValue("collectorName", e.target.value)}
							/>
						{/* 	<Input
								error={additionalInfoErrors["additionalInfo.financialShare"]}
								label={t("admin.collectors.financial-share")}
								min={0}
								placeholder={t("admin.collectors.financial-share-placeholder")}
								step="any"
								type="number"
								value={values.additionalInfo?.financialShare || ""}
								onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
								onChange={e =>
									setFieldValue("additionalInfo", { ...values.additionalInfo, financialShare: e.target.value })
								}
							/> */}
							<Input
								error={additionalInfoErrors["additionalInfo.accountingFees"]}
								label={t("admin.collectors.accounting-fees")}
								min={0}
								placeholder={t("admin.collectors.accounting-fees-placeholder")}
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
								label={t("admin.collectors.accounting-cancellation-fees")}
								min={0}
								placeholder={t("admin.collectors.accounting-cancellation-fees-placeholder")}
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
							<MobileInput
								error={additionalInfoErrors["additionalInfo.contact_number"]}
								label={t("admin.collectors.contact-number")}
								placeholder={t("admin.collectors.contact-number-placeholder")}
								value={values.additionalInfo?.contact_number || ""}
								onChange={e =>
									setFieldValue("additionalInfo", { ...values.additionalInfo, contact_number: e.target.value })
								}
							/>
							<Input
								error={additionalInfoErrors["additionalInfo.email_address"]}
								label={t("admin.collectors.email-address")}
								placeholder={t("admin.collectors.email-address-placeholder")}
								type="text"
								value={values.additionalInfo?.email_address || ""}
								onChange={e =>
									setFieldValue("additionalInfo", { ...values.additionalInfo, email_address: e.target.value })
								}
							/>
							<div className="flex flex-col gap-1.5">
								<label className="text-sm font-medium text-gray-700">
									{t("admin.collectors.allow-overdraft")}
								</label>
								<div className="flex gap-4">
									<label className="flex cursor-pointer items-center gap-2">
										<input
											checked={values.allowsOverdraft === true}
											className="h-4 w-4 accent-[#404040]"
											name="allowsOverdraft"
											type="radio"
											value="yes"
											onChange={() => setFieldValue("allowsOverdraft", true)}
										/>
										<span className="text-sm text-gray-700">Yes</span>
									</label>
									<label className="flex cursor-pointer items-center gap-2">
										<input
											checked={values.allowsOverdraft !== true}
											className="h-4 w-4 accent-[#404040]"
											name="allowsOverdraft"
											type="radio"
											value="no"
											onChange={() => setFieldValue("allowsOverdraft", false)}
										/>
										<span className="text-sm text-gray-700">No</span>
									</label>
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-3 pt-8">
							<Button
								className="h-10 w-[20%] rounded-md border border-[#404040] bg-white px-6 text-gray-800 hover:bg-white"
								type="button"
								onClick={() => setOpen(false)}
							>
								{t("admin.common.cancel")}
							</Button>

							<Button
								className="h-10 w-[20%] rounded-md bg-[#404040] font-semibold text-white hover:bg-[#2f2f2f]"
								loading={isPending}
								type="submit"
							>
								{t("admin.collectors.add-collector")}
							</Button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
