import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useUpdateInsurer } from "@/api/endpoints/back-office/insurers/update-insurer.api";
import { IInsurer } from "@/api/types/insurer";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { CrNumberInput } from "@/components/ui/cr-number-input";
import { Input } from "@/components/ui/input";
import { MobileInput } from "@/components/ui/mobile-input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface InsurerInformationProps extends IInsurer {}

export const InsurerInformation = (props: InsurerInformationProps) => {
	const { id, crNumber, facilityName, insurerName, additionalInfo } = props;

	const { t } = useTranslationContext();

	const [isEditing, setIsEditing] = useState(false);

	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { mutate } = useUpdateInsurer(
		{ id },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: ["back-office", "insurers", String(id)],
				});
			},
			onSuccess: () => {
				setIsEditing(false);
			},
		},
	);

	const { setFieldValue, values, handleSubmit, errors } = useForm<{
		crNumber?: number;
		facilityName?: string;
		insurerName?: string;
		additionalInfo?: any;
	}>({
		initialValues: {
			additionalInfo: additionalInfo || {},
			crNumber,
			facilityName,
			insurerName,
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
		<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
			<div className="flex items-end justify-between">
				<label className="font-bold">{t("admin.insurers.insurance-details")}</label>

				{isEditing && (
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="destructive"
							onClick={() => {
								setIsEditing(false);
							}}
						>
							<Icon className="h-4 w-4 fill-white" name="X" />
							{t("admin.common.cancel")}
						</Button>

						<Button size="sm" type="submit">
							<Icon className="h-4 w-4 fill-white" name="ClipboardCheck" />
							{t("admin.common.save")}
						</Button>
					</div>
				)}

				{!isEditing && (
					<Button size="sm" type="button" onClick={() => setIsEditing(true)}>
						<Icon className="h-4 w-4 fill-white" name="Edit" />
						{t("admin.common.edit")}
					</Button>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4 rounded-md bg-[#EFF5F9] p-4">
				<CrNumberInput
					disabled={!isEditing}
					error={errors.crNumber}
					label={t("admin.insurers.cr-number")}
					placeholder={t("admin.insurers.cr-number-placeholder")}
					value={values.crNumber}
					onChange={value => setFieldValue("crNumber", value)}
					readOnly
				/>

				<Input
					disabled={!isEditing}
					error={errors.facilityName}
					label={t("admin.insurers.facility-name")}
					placeholder={t("admin.insurers.facility-name-placeholder")}
					type="text"
					value={values.facilityName}
					onChange={e => setFieldValue("facilityName", e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					error={errors.insurerName}
					label={t("admin.insurers.insurer-name")}
					placeholder={t("admin.insurers.insurer-name-placeholder")}
					type="text"
					value={values.insurerName}
					onChange={e => setFieldValue("insurerName", e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					error={additionalInfoErrors["additionalInfo.financialShare"]}
					label={t("admin.insurers.financial-share")}
					min={0}
					placeholder={t("admin.insurers.financial-share-placeholder")}
					step="any"
					type="number"
					value={values.additionalInfo?.financialShare || ""}
					onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
					onChange={e =>
						setFieldValue("additionalInfo", {
							...values.additionalInfo,
							financialShare: e.target.value,
						})
					}
				/>

				<Input
					disabled={!isEditing}
					error={additionalInfoErrors["additionalInfo.accountingFees"]}
					label={t("admin.insurers.accounting-fees")}
					min={0}
					placeholder={t("admin.insurers.accounting-fees-placeholder")}
					step="any"
					type="number"
					value={values.additionalInfo?.accountingFees || ""}
					onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
					onChange={e =>
						setFieldValue("additionalInfo", {
							...values.additionalInfo,
							accountingFees: e.target.value,
						})
					}
				/>

				<Input
					disabled={!isEditing}
					error={additionalInfoErrors["additionalInfo.accountingCancellationFees"]}
					label={t("admin.insurers.accounting-cancellation-fees")}
					min={0}
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
					disabled={!isEditing}
					error={additionalInfoErrors["additionalInfo.email"]}
					label={t("admin.insurers.email-address")}
					placeholder={t("admin.insurers.email-address-placeholder")}
					type="text"
					value={values.additionalInfo?.email || ""}
					onChange={e =>
						setFieldValue("additionalInfo", {
							...values.additionalInfo,
							email: e.target.value,
						})
					}
				/>

				<MobileInput
					disabled={!isEditing}
					error={additionalInfoErrors["additionalInfo.phone"]}
					label={t("admin.insurers.phone-number")}
					placeholder={t("admin.insurers.phone-number-placeholder")}
					value={values.additionalInfo?.phone || ""}
					onChange={e =>
						setFieldValue("additionalInfo", {
							...values.additionalInfo,
							phone: e.target.value,
						})
					}
				/>
			</div>
		</form>
	);
};
