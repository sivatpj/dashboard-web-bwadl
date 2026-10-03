import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { useFetchBankReferenceAccounts } from "@/api/endpoints/back-office/banks/fetch-bank-accounts";
import { useUpdateFinancier } from "@/api/endpoints/back-office/financiers/update-financier.api";
import { IFinancier } from "@/api/types";
import { BankReferenceAccountPopUp } from "@/components/entities/admin/dashboard/shared/bank-reference-account-popup";
import { DeleteBankReferencePopUp } from "@/components/entities/admin/dashboard/shared/delete-bank-reference-popup";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { CrNumberInput } from "@/components/ui/cr-number-input";
import { Input } from "@/components/ui/input";
import { isValidSaudiMobile, MobileInput } from "@/components/ui/mobile-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

export const FinancierEditForm = (props: IFinancier) => {
	const { id, crNumber, facilityName, financierName, limit, additionalInfo } = props;

	const { t } = useTranslationContext();
	const [isEditing, setIsEditing] = useState(false);
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const referenceAccountsQuery = useFetchBankReferenceAccounts(id, "financier");
	const referenceAccounts = referenceAccountsQuery.data?.references ?? [];

	const { mutate, isPending } = useUpdateFinancier(
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
					queryKey: ["back-office", "financiers", String(id)],
				});
			},
			onSuccess: () => {
				setIsEditing(false);
			},
		},
	);

	const { setFieldValue, values, handleSubmit, errors, resetForm } = useForm<{
		crNumber?: number;
		facilityName?: string;
		financierName?: string;
		limit?: number;
		contactNumber?: string;
		email?: string;
	}>({
		initialValues: {
			contactNumber: additionalInfo?.phone || additionalInfo?.contact || additionalInfo?.contactNumber,
			crNumber,
			email: additionalInfo?.email || additionalInfo?.emailAddress,
			facilityName,
			financierName,
			limit,
		},
		onSubmit: values => {
			mutate({
				additionalInfo: {
					...additionalInfo,
					email: values.email,
					phone: values.contactNumber,
				},
				contactNumber: values.contactNumber,
				crNumber: values.crNumber,
				email: values.email,
				facilityName: values.facilityName,
				financierName: values.financierName,
				limit: values.limit,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (values.crNumber?.toString().length !== 10) {
				errors.crNumber = t("admin.financiers.validation.cr-number");
			}
			if (!values.facilityName) {
				errors.facilityName = t("admin.financiers.validation.facility-name");
			}
			if (!values.financierName) {
				errors.financierName = t("admin.financiers.validation.financier-name");
			}
			if (values.limit && values.limit <= 0) {
				errors.limit = t("admin.financiers.validation.limit");
			}
			if (values.contactNumber && !isValidSaudiMobile(values.contactNumber)) {
				errors.contactNumber = t("admin.financiers.validation.contact-number");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
			<div className="flex items-end justify-between">
				<label className="font-bold">{t("admin.financiers.financier-details")}</label>
				{isEditing ? (
					<div className="flex items-center gap-2">
						<Button
							disabled={isPending}
							size="sm"
							type="button"
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
				) : (
					<Button size="sm" type="button" onClick={() => setIsEditing(true)}>
						<Icon className="h-4 w-4 fill-white" name="Edit" />
						{t("admin.common.edit")}
					</Button>
				)}
			</div>

			<div className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-md bg-[#EFF5F9] p-6">
				<CrNumberInput
					disabled={!isEditing}
					error={errors.crNumber}
					label={t("admin.financiers.cr-number")}
					placeholder={t("admin.financiers.cr-number-placeholder")}
					value={values.crNumber}
					readOnly
					onChange={value => setFieldValue("crNumber", value)}
				/>

				<Input
					disabled={!isEditing}
					error={errors.facilityName}
					label={t("admin.financiers.facility-name")}
					placeholder={t("admin.financiers.facility-name-placeholder")}
					type="text"
					value={values.facilityName}
					onChange={e => setFieldValue("facilityName", e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					error={errors.financierName}
					label={t("admin.financiers.financier-name")}
					placeholder={t("admin.financiers.financier-name-placeholder")}
					type="text"
					value={values.financierName}
					onChange={e => setFieldValue("financierName", e.target.value)}
				/>

				<AmountInput
					disabled={!isEditing}
					error={errors.limit}
					label={t("admin.financiers.limit")}
					placeholder={t("admin.financiers.limit-placeholder")}
					value={values.limit}
					onChange={value => setFieldValue("limit", value)}
				/>

				<MobileInput
					disabled={!isEditing}
					error={errors.contactNumber}
					label={t("admin.financiers.contact-number")}
					placeholder={t("admin.financiers.contact-number-placeholder")}
					value={values.contactNumber || ""}
					onChange={e => setFieldValue("contactNumber", e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.financiers.email")}
					placeholder={t("admin.financiers.email-placeholder")}
					type="text"
					value={values.email || ""}
					onChange={e => setFieldValue("email", e.target.value)}
				/>
			</div>

			<hr className="border-[#D5E1E9]" />

			<div className="flex items-center justify-between">
				<label className="font-bold">{t("admin.financiers.reference-account")}</label>
				<BankReferenceAccountPopUp
					mappedAccountCodes={referenceAccounts.map(reference => reference.accountCode)}
					participantId={id}
					participantType="financier"
					trigger={
						<Button size="sm" type="button">
							<Icon className="h-4 w-4 fill-white" name="PlusBox" />
							{t("admin.financiers.reference-account")}
						</Button>
					}
				/>
			</div>

			<div className="overflow-x-auto rounded-md bg-[#EFF5F9]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("admin.statements.account-code")}</TableHead>
							<TableHead>{t("admin.statements.account-type")}</TableHead>
							<TableHead>{t("admin.statements.purpose-type")}</TableHead>
							<TableHead>Account Description</TableHead>
							<TableHead>{t("admin.statements.currency")}</TableHead>
							<TableHead>Created By</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Updated At</TableHead>
							<TableHead>Updated By</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>
					<TableBody>
						{referenceAccounts.map(reference => (
							<TableRow key={reference.accountCode}>
								<TableCell>{reference.accountCode}</TableCell>
								<TableCell>{reference.accountType}</TableCell>
								<TableCell className="capitalize">{reference.purpose}</TableCell>
								<TableCell>{reference.accountDescription}</TableCell>
								<TableCell>{reference.currencyCode}</TableCell>
								<TableCell>{reference.createdByName || reference.createdBy}</TableCell>
								<TableCell>{dayjs(reference.createdAt).format("DD/MM/YYYY HH:mm")}</TableCell>
								<TableCell>{dayjs(reference.updatedAt).format("DD/MM/YYYY HH:mm")}</TableCell>
								<TableCell>{reference.updatedByName || reference.updatedBy}</TableCell>
								<TableCell>
									<DeleteBankReferencePopUp
										accountCode={reference.accountCode}
										bankLabel={reference.shortName || reference.bankName || reference.accountCode}
										participantId={id}
										participantType="financier"
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</form>
	);
};
