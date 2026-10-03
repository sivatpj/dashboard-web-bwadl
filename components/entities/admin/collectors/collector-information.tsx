import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useUpdateCollector } from "@/api/endpoints/back-office/collectors/update-collector.api";
import { ICollector } from "@/api/types";
import { FormattedNumber } from "@/components/global/formatted-number";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { CrNumberInput } from "@/components/ui/cr-number-input";
import { Input } from "@/components/ui/input";
import { MobileInput } from "@/components/ui/mobile-input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface CollectorInformationProps extends ICollector {
	invoicesAmount: number;
	collectedAmount: number;
	remainingAmount: number;
	allowsOverdraft?: boolean;
	totalInvoicesCount?: number;
	collectorSummary?: {
		totalBuyersUnderCollector: number;
		totalPaidAmount: number;
		totalOutstandingAmount: number;
		totalOverdueAmount: number;
	};
}

export const CollectorInformation = (props: CollectorInformationProps) => {
	const {
		id,
		invoicesAmount,
		crNumber,
		facilityName,
		collectorName,
		additionalInfo = {},
		allowsOverdraft,
		totalInvoicesCount,
		collectorSummary,
	} = props;

	const { t } = useTranslationContext();

	const [isEditing, setIsEditing] = useState(false);

	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { mutate, isPending } = useUpdateCollector(
		{
			id,
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
				queryClient.invalidateQueries({ queryKey: ["back-office", "collectors", String(id)] });
			},
			onSuccess: () => {
				setIsEditing(false);
			},
		},
	);

	const { setFieldValue, values, handleSubmit, errors, resetForm } = useForm<{
		crNumber?: number;
		facilityName?: string;
		collectorName?: string;
		additionalInfo?: any;
		allowsOverdraft?: boolean;
	}>({
		initialValues: {
			additionalInfo: additionalInfo || {},
			allowsOverdraft: allowsOverdraft ?? false,
			collectorName,
			crNumber,
			facilityName,
		},
		onSubmit: values => {
			mutate(values);
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

			if (
				values.additionalInfo?.email &&
				!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.additionalInfo.email)
			) {
				errors["additionalInfo.email"] = t("admin.collectors.validation.email");
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
		<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
			<div className="flex items-end justify-between">
				<label className="font-bold">{t("admin.collectors.collector-details")}</label>

				{isEditing && (
					<div className="flex items-center gap-2">
						<Button
							disabled={isPending}
							size="sm"
							variant="destructive"
							onClick={() => {
								resetForm();
								setIsEditing(false);
							}}
						>
							<Icon className="h-4 w-4 fill-white" name="X" />
							{t("admin.common.cancel")}
						</Button>

						<Button disabled={isPending} size="sm" type="submit">
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
					defaultValue={crNumber}
					disabled={!isEditing}
					error={errors.crNumber}
					label={t("admin.collectors.cr-number")}
					placeholder={t("admin.collectors.cr-number-placeholder")}
					value={values.crNumber}
					onChange={value => setFieldValue("crNumber", value)}
					readOnly
				/>

				<Input
					defaultValue={facilityName}
					disabled={!isEditing}
					error={errors.facilityName}
					label={t("admin.collectors.facility-name")}
					placeholder={t("admin.collectors.facility-name-placeholder")}
					type="text"
					value={values.facilityName}
					onChange={e => setFieldValue("facilityName", e.target.value)}
				/>

				<Input
					defaultValue={collectorName}
					disabled={!isEditing}
					error={errors.collectorName}
					label={t("admin.collectors.collector-name")}
					placeholder={t("admin.collectors.collector-name-placeholder")}
					type="text"
					value={values.collectorName}
					onChange={e => setFieldValue("collectorName", e.target.value)}
				/>

			{/* 	<Input
					defaultValue={additionalInfo?.financialShare}
					disabled={!isEditing}
					label={t("admin.collectors.financial-share")}
					min={0}
					placeholder={t("admin.collectors.financial-share-placeholder")}
					step="any"
					type="number"
					value={values.additionalInfo?.financialShare || ""}
					onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
					onChange={e => setFieldValue("additionalInfo", { ...values.additionalInfo, financialShare: e.target.value })}
				/>
 */}
				<Input
					defaultValue={additionalInfo?.accountingFees}
					disabled={!isEditing}
					label={t("admin.collectors.accounting-fees")}
					min={0}
					placeholder={t("admin.collectors.accounting-fees-placeholder")}
					step="any"
					type="number"
					value={values.additionalInfo?.accountingFees || ""}
					onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
					onChange={e => setFieldValue("additionalInfo", { ...values.additionalInfo, accountingFees: e.target.value })}
				/>

				<Input
					defaultValue={additionalInfo?.accountingCancellationFees}
					disabled={!isEditing}
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
					disabled={!isEditing}
					error={additionalInfoErrors["additionalInfo.contact_number"]}
					label={t("admin.collectors.contact-number")}
					placeholder={t("admin.collectors.contact-number-placeholder")}
					value={values.additionalInfo?.contact_number || ""}
					onChange={e => setFieldValue("additionalInfo", { ...values.additionalInfo, contact_number: e.target.value })}
				/>

				<Input
					defaultValue={additionalInfo?.email}
					disabled={!isEditing}
					error={additionalInfoErrors["additionalInfo.email"]}
					label={t("admin.collectors.email-address")}
					placeholder={t("admin.collectors.email-address-placeholder")}
					type="text"
					value={values.additionalInfo?.email_address || ""}
					onChange={e => setFieldValue("additionalInfo", { ...values.additionalInfo, email: e.target.value })}
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
								disabled={!isEditing}
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
								disabled={!isEditing}
								name="allowsOverdraft"
								type="radio"
								value="no"
								onChange={() => setFieldValue("allowsOverdraft", false)}
							/>
							<span className="text-sm text-gray-700">No</span>
						</label>
					</div>
				</div>

				<Input
					disabled
					label={t("admin.collectors.total-buyers-under-arzaq-plus")}
					placeholder={t("admin.collectors.total-buyers-under-arzaq-plus-placeholder")}
					type="text"
					value={collectorSummary?.totalBuyersUnderCollector ?? additionalInfo?.totalBuyersUnderCollector ?? ""}
					readOnly
				/>

				<Input
					disabled
					label={t("admin.collectors.total-invoices-under-collector")}
					type="text"
					value={totalInvoicesCount ?? ""}
					readOnly
				/>

				<AmountInput
					disabled
					label={t("admin.collectors.total-paid-amount")}
					readOnly
					value={collectorSummary?.totalPaidAmount ?? 0}
				/>

				<AmountInput
					disabled
					label={t("admin.collectors.total-outstanding-amount")}
					readOnly
					value={collectorSummary?.totalOutstandingAmount ?? 0}
				/>

				<AmountInput
					disabled
					label={t("admin.collectors.total-overdue-amount")}
					readOnly
					value={collectorSummary?.totalOverdueAmount ?? 0}
				/>
			</div>
		</form>
	);
};
