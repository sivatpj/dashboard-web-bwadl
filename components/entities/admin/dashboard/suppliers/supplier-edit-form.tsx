import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { useFetchBankReferenceAccounts } from "@/api/endpoints/back-office/banks/fetch-bank-accounts";
import { useUpdateSupplier } from "@/api/endpoints/back-office/suppliers/update-supplier.api";
import { ISupplier } from "@/api/types";
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

export const SupplierEditForm = (props: ISupplier) => {
	const { id, crNumber, facilityName, supplierName, limit, additionalInfo, allowsOverdraft } = props;

	const { t } = useTranslationContext();
	const [isEditing, setIsEditing] = useState(false);
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const referenceAccountsQuery = useFetchBankReferenceAccounts(id, "supplier");
	const referenceAccounts = referenceAccountsQuery.data?.references ?? [];

	const { mutate, isPending } = useUpdateSupplier(
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
					queryKey: ["back-office", "suppliers", String(id)],
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
		supplierName?: string;
		limit?: number;
		additionalInfo?: any;
		allowsOverdraft?: boolean;
		phone?: string;
	}>({
		initialValues: {
			additionalInfo,
			allowsOverdraft,
			crNumber,
			facilityName,
			limit,
			supplierName,
		},
		onSubmit: values => {
			mutate({
				additionalInfo: values.additionalInfo,
				allowsOverdraft: values.allowsOverdraft,
				crNumber: values.crNumber,
				facilityName: values.facilityName,
				limit: values.limit,
				supplierName: values.supplierName,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (values.crNumber?.toString().length !== 10) {
				errors.crNumber = t("admin.buyers.validation.cr-number");
			}
			if (!values.facilityName) {
				errors.facilityName = t("admin.buyers.validation.facility-name");
			}
			if (!values.supplierName) {
				errors.supplierName = t("admin.buyers.validation.buyer-name");
			}
			if (values.limit && values.limit <= 0) {
				errors.limit = t("admin.buyers.validation.credit-limit");
			}
			if (values.additionalInfo?.phone && !isValidSaudiMobile(values.additionalInfo.phone)) {
				errors.phone = t("admin.suppliers.validation.contact-number");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
			<div className="flex items-end justify-between">
				<label className="font-bold">{t("admin.suppliers.supplier-details")}</label>
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
					label={t("admin.suppliers.cr-number")}
					placeholder={t("admin.suppliers.cr-number")}
					value={values.crNumber}
					readOnly
					onChange={value => setFieldValue("crNumber", value)}
				/>

				<Input
					disabled={!isEditing}
					error={errors.facilityName}
					label={t("admin.suppliers.facility-name")}
					placeholder={t("admin.suppliers.facility-name")}
					type="text"
					value={values.facilityName}
					/* readOnly */
					onChange={e => setFieldValue("facilityName", e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					error={errors.supplierName}
					label={t("admin.suppliers.supplier-name")}
					placeholder={t("admin.suppliers.supplier-name")}
					type="text"
					value={values.supplierName}
					/* readOnly */
					onChange={e => setFieldValue("supplierName", e.target.value)}
				/>

				<AmountInput
					disabled={!isEditing}
					error={errors.limit}
					label={t("admin.suppliers.advance-cap-limit")}
					placeholder={t("admin.suppliers.advance-cap-limit")}
					value={values.limit}
					onChange={value => setFieldValue("limit", value)}
				/>

				<MobileInput
					disabled={!isEditing}
					error={errors.phone}
					label={t("admin.suppliers.phone-number")}
					placeholder={t("admin.suppliers.phone-number")}
					value={values.additionalInfo?.phone || ""}
					onChange={e =>
						setFieldValue("additionalInfo", {
							...values.additionalInfo,
							phone: e.target.value,
						})
					}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.suppliers.email-address")}
					placeholder={t("admin.suppliers.email-address")}
					type="text"
					value={values.additionalInfo?.contact || ""}
					onChange={e =>
						setFieldValue("additionalInfo", {
							...values.additionalInfo,
							contact: e.target.value,
						})
					}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.buyer.comments")}
					placeholder={t("admin.buyer.comments-placeholder")}
					type="text"
					value={values.additionalInfo?.comments || ""}
					onChange={e =>
						setFieldValue("additionalInfo", {
							...values.additionalInfo,
							comments: e.target.value,
						})
					}
				/>

				<div className="flex flex-col gap-1.5">
					<label className="text-sm font-medium text-gray-700">
						{t("admin.suppliers.allow-overdraft")}
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
			</div>

			<hr className="border-[#D5E1E9]" />

			<div className="flex items-center justify-between">
				<label className="font-bold">{t("admin.suppliers.reference-account")}</label>
				<BankReferenceAccountPopUp
					mappedAccountCodes={referenceAccounts.map(reference => reference.accountCode)}
					participantId={id}
					participantType="supplier"
					trigger={
						<Button size="sm" type="button">
							<Icon className="h-4 w-4 fill-white" name="PlusBox" />
							{t("admin.suppliers.reference-account")}
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
										participantType="supplier"
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
