import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useFetchBuyerFinancierLimits } from "@/api/endpoints/back-office/buyers/fetch-buyer-financier-limits";
import { useUpdateBuyer } from "@/api/endpoints/back-office/buyers/update-buyer.api";
import { useFetchCollectors } from "@/api/endpoints/back-office/collectors/fetch-collectors";
import { useFetchInsurers } from "@/api/endpoints/back-office/insurers/fetch-insurers";
import { useFetchParticipantDefaults } from "@/api/endpoints/back-office/participant-defaults/fetch-participant-defaults";
import { useUpsertParticipantDefaults } from "@/api/endpoints/back-office/participant-defaults/upsert-participant-defaults.api";
import { IBuyer, IBuyerAccount, IParticipantAccount } from "@/api/types";
import { FormattedNumber } from "@/components/global/formatted-number";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { AutoCompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { CrNumberInput } from "@/components/ui/cr-number-input";
import { Input } from "@/components/ui/input";
import { isValidSaudiMobile, MobileInput } from "@/components/ui/mobile-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";
import { BuyerCreateAccountPopUp } from "./buyer-create-account-popup";
import { BuyerFinancierLimitCreatePopUp } from "./buyer-financier-limit-create-popup";
import { BuyerFinancierLimitDeletePopUp } from "./buyer-financier-limit-delete-popup";
import { BuyerFinancierLimitEditPopUp } from "./buyer-financier-limit-edit-popup";
import { SelectSupplierPopUp } from "./buyer-select-reference";

interface BuyerEditFormProps extends IBuyer {
	participantBuyerReferences: IParticipantAccount[];
	participantAccounts: IBuyerAccount[];
}

export const BuyerEditForm = (props: BuyerEditFormProps) => {
	const {
		id,
		crNumber,
		facilityName,
		buyerName,
		creditLimit,
		repaymentPeriod,
		installmentNumber,
		additionalInfo,
		participantBuyerReferences,
		participantAccounts,
	} = props;

	const { t } = useTranslationContext();

	const [isEditing, setIsEditing] = useState(false);
	const [collectorSearch, setCollectorSearch] = useState("");
	const [insurerSearch, setInsurerSearch] = useState("");

	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { data: insurersData } = useFetchInsurers();
	const { data: collectorsData } = useFetchCollectors();
	const { data: participantDefaultsData } = useFetchParticipantDefaults({ id, type: "buyer" });
	const { data: financierLimitsData } = useFetchBuyerFinancierLimits({ id });

	const { mutate: upsertParticipantDefaults } = useUpsertParticipantDefaults({
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "participant-defaults", String(id)] });
		},
	});

	const { mutate, isPending } = useUpdateBuyer(
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
					queryKey: ["back-office", "buyers", String(id)],
				});
			},
			onSuccess: () => {
				if (values.defaultCollectorId || values.defaultInsurerId) {
					upsertParticipantDefaults({
						collectorId: values.defaultCollectorId || undefined,
						insurerId: values.defaultInsurerId || undefined,
						participantId: id,
						participantType: "buyer",
					});
				}

				setIsEditing(false);
			},
		},
	);

	const { setFieldValue, values, handleSubmit, errors, resetForm } = useForm<{
		crNumber?: number;
		facilityName?: string;
		buyerName?: string;
		creditLimit?: number;
		repaymentPeriod?: number;
		installmentNumber?: number;
		additionalInfo?: any;
		participantBuyerReferences?: IParticipantAccount[];
		defaultCollectorId?: number;
		defaultInsurerId?: number;
	}>({
		initialValues: {
			additionalInfo,
			buyerName,
			creditLimit,
			crNumber,
			defaultCollectorId: Number(),
			defaultInsurerId: Number(),
			facilityName,
			installmentNumber,
			participantBuyerReferences,
			repaymentPeriod,
		},
		onSubmit: values => {
			const {
				participantBuyerReferences,
				crNumber,
				facilityName,
				buyerName,
				creditLimit,
				repaymentPeriod,
				installmentNumber,
				additionalInfo,
			} = values;

			mutate({
				additionalInfo,
				buyerName,
				creditLimit,
				crNumber,
				facilityName,
				installmentNumber,
				references: participantBuyerReferences,
				repaymentPeriod,
			});
		},

		validate(values) {
			const errors: Record<string, string> = {};

			// CR (Commercial Registration) number is optional on edit, but if provided must be exactly 10 digits
			if (values.crNumber && !/^\d{10}$/.test(values.crNumber.toString())) {
				errors.crNumber = t("admin.buyers.validation.cr-number");
			}
			if (!values.facilityName) {
				errors.facilityName = t("admin.buyers.validation.facility-name");
			}
			if (!values.buyerName) {
				errors.buyerName = t("admin.buyers.validation.buyer-name");
			}
			if (values.creditLimit && values.creditLimit <= 0) {
				errors.creditLimit = t("admin.buyers.validation.credit-limit");
			}
			if (values.additionalInfo?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.additionalInfo.email)) {
				errors.email = t("admin.buyers.validation.email");
			}
			if (values.additionalInfo?.phone && !isValidSaudiMobile(values.additionalInfo.phone)) {
				errors.phone = t("admin.buyers.validation.contact-number");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	useEffect(() => {
		if (!participantDefaultsData?.participantDefaults) return;

		setFieldValue("defaultCollectorId", participantDefaultsData.participantDefaults.collectorId || Number());
		setFieldValue("defaultInsurerId", participantDefaultsData.participantDefaults.insurerId || Number());
	}, [participantDefaultsData]);

	return (
		<form className="flex flex-col gap-2" noValidate onSubmit={handleSubmit}>
			<div className="flex items-end justify-between">
				<label className="font-bold">{t("admin.buyer.buyer-information")}</label>
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
					label={t("admin.buyer.cr-number")}
					placeholder={t("admin.buyer.cr-number-placeholder")}
					value={values.crNumber}
					onChange={value => setFieldValue("crNumber", value)}
				/>

				<Input
					disabled={!isEditing}
					error={errors.facilityName}
					label={t("admin.buyer.facility-name")}
					placeholder={t("admin.buyer.facility-name-placeholder")}
					type="text"
					value={values.facilityName}
					onChange={e => setFieldValue("facilityName", e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					error={errors.buyerName}
					label={t("admin.buyer.buyer-name")}
					placeholder={t("admin.buyer.buyer-name-placeholder")}
					type="text"
					value={values.buyerName}
					readOnly
					onChange={e => setFieldValue("buyerName", e.target.value)}
				/>

				<AmountInput
					disabled={!isEditing}
					error={errors.creditLimit}
					label={t("admin.buyer.credit-limit")}
					placeholder={t("admin.buyer.credit-limit-placeholder")}
					value={values.creditLimit}
					// readOnly
					onChange={value => setFieldValue("creditLimit", value)}
				/>

				<Input
					disabled={!isEditing}
					icon={t("admin.buyers.days")}
					label={t("admin.buyer.repayment-period")}
					min={0}
					placeholder={t("admin.buyer.repayment-period-placeholder")}
					type="number"
					value={values.repaymentPeriod === 0 ? "" : values.repaymentPeriod}
					onChange={e => setFieldValue("repaymentPeriod", Number(e.target.value))}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.buyers.number-of-installments")}
					min={0}
					placeholder={t("admin.buyers.number-of-installments-placeholder")}
					type="number"
					value={values.installmentNumber === 0 ? "" : values.installmentNumber}
					onChange={e => setFieldValue("installmentNumber", Number(e.target.value))}
				/>

				<SelectSupplierPopUp
					disabled={!isEditing}
					trigger={<Button className="h-[42px] w-[45%] font-semibold leading-none">Select Reference</Button>}
					values={values.participantBuyerReferences}
					onSelect={references => setFieldValue("participantBuyerReferences", references)}
				/>

				<AutoCompleteInput
					items={(collectorsData?.collectors ?? []).map(collector => ({
						label: collector.collectorName,
						value: collector.id,
					}))}
					disabled={!isEditing}
					label={t("admin.buyers.default-collector")}
					placeholder={t("admin.buyers.default-collector-placeholder")}
					searchValue={collectorSearch}
					selectedValue={values.defaultCollectorId || undefined}
					onSearchValueChange={setCollectorSearch}
					onSelectedValueChange={value => setFieldValue("defaultCollectorId", value ?? 0)}
					onClear={() => {
						setFieldValue("defaultCollectorId", 0);
						setCollectorSearch("");
					}}
				/>

				<AutoCompleteInput
					items={(insurersData?.insurers ?? []).map(insurer => ({
						label: insurer.insurerName,
						value: insurer.id,
					}))}
					disabled={!isEditing}
					label={t("admin.buyers.default-insurer")}
					placeholder={t("admin.buyers.default-insurer-placeholder")}
					searchValue={insurerSearch}
					selectedValue={values.defaultInsurerId || undefined}
					onSearchValueChange={setInsurerSearch}
					onSelectedValueChange={value => setFieldValue("defaultInsurerId", value ?? 0)}
					onClear={() => {
						setFieldValue("defaultInsurerId", 0);
						setInsurerSearch("");
					}}
				/>

				<Input
					disabled={!isEditing}
					error={typeof errors.additionalInfo === "object" ? (errors.additionalInfo as { email?: string })?.email : undefined}
					label={t("admin.buyer.email")}
					placeholder={t("admin.buyer.email-placeholder")}
					type="email"
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
					error={typeof errors.additionalInfo === "object" ? (errors.additionalInfo as { phone?: string })?.phone : undefined}
					label={t("admin.buyer.mobile-number")}
					placeholder={t("admin.buyer.mobile-number-placeholder")}
					value={values.additionalInfo?.phone || ""}
					onChange={e =>
						setFieldValue("additionalInfo", {
							...values.additionalInfo,
							phone: e.target.value,
						})
					}
				/>

				<div className="flex items-start gap-4">
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
				</div>
			</div>

			<hr className="border-[#D5E1E9]" />

			<div className="flex items-center justify-between">
				<label className="font-bold">Buyer Financier Limit</label>
				<BuyerFinancierLimitCreatePopUp
					buyerId={id}
					excludeFinancierIds={(financierLimitsData?.financierLimits ?? []).map(
						financierLimit => financierLimit.financierId,
					)}
					trigger={
						<Button size="sm" type="button">
							<Icon className="h-4 w-4 fill-white" name="PlusBox" />
							Create
						</Button>
					}
				/>
			</div>

			<div className="overflow-x-auto rounded-md bg-[#EFF5F9]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Financier</TableHead>
							<TableHead>Credit Limit</TableHead>
							<TableHead>Available Limit</TableHead>
							<TableHead>Repayment Period</TableHead>
							<TableHead>Number of Installments</TableHead>
							<TableHead>Use Limit</TableHead>
							<TableHead>Created By</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Updated By</TableHead>
							<TableHead>Updated At</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>
					<TableBody>
						{(financierLimitsData?.financierLimits || []).map(financierLimit => (
							<TableRow key={financierLimit.financierId}>
								<TableCell>{financierLimit.financierFacilityName || financierLimit.financierName}</TableCell>
								<TableCell>
									<FormattedNumber value={financierLimit.creditLimit} />
								</TableCell>
								<TableCell>
									<FormattedNumber value={financierLimit.availableLimit} />
								</TableCell>
								<TableCell>{financierLimit.repaymentPeriod}</TableCell>
								<TableCell>{financierLimit.installmentNumber}</TableCell>
								<TableCell>{financierLimit.setAndUseLimit ? "Yes" : "No"}</TableCell>
								<TableCell>{financierLimit.createdByName || financierLimit.createdBy}</TableCell>
								<TableCell>{dayjs(financierLimit.createdAt).format("DD/MM/YYYY HH:mm")}</TableCell>
								<TableCell>{financierLimit.updatedByName || financierLimit.updatedBy}</TableCell>
								<TableCell>{dayjs(financierLimit.updatedAt).format("DD/MM/YYYY HH:mm")}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<BuyerFinancierLimitEditPopUp
											buyerId={id}
											financierLimit={financierLimit}
											trigger={
												<Button size="sm" type="button" variant="outline">
													<Icon className="h-4 w-4" name="Edit" />
													{t("admin.common.edit")}
												</Button>
											}
										/>
										<BuyerFinancierLimitDeletePopUp
											buyerId={id}
											financierId={financierLimit.financierId}
											financierName={financierLimit.financierFacilityName || financierLimit.financierName}
											trigger={
												<Button
													className="h-8 w-8 p-0 flex items-center justify-center border border-transparent hover:border-red-600 hover:bg-red-50"
													size="sm"
													type="button"
													variant="ghost"
												>
													<Icon className="h-4 w-4 fill-red-600" name="Bin" />
												</Button>
											}
										/>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<hr className="border-[#D5E1E9]" />

			<div className="flex items-center justify-between">
				<label className="font-bold">Accounts</label>
				<BuyerCreateAccountPopUp
					buyerId={id}
					trigger={
						<Button size="sm" type="button">
							<Icon className="h-4 w-4 fill-white" name="PlusBox" />
							Create Account
						</Button>
					}
				/>
			</div>

			<div className="overflow-x-auto rounded-md bg-[#EFF5F9]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Account Code</TableHead>
							<TableHead>Account Type</TableHead>
							<TableHead>Purpose</TableHead>
							<TableHead>Account Description</TableHead>
							<TableHead>Currency Code</TableHead>
							<TableHead>Created By</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Updated At</TableHead>
							<TableHead>Updated By</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{(participantAccounts || []).map(account => (
							<TableRow key={account.accountCode}>
								<TableCell>{account.accountCode}</TableCell>
								<TableCell>{account.accountType}</TableCell>
								<TableCell className="capitalize">{account.purpose}</TableCell>
								<TableCell>{account.accountDescription}</TableCell>
								<TableCell>{account.currencyCode}</TableCell>
								<TableCell>{account.createdByName || account.createdBy}</TableCell>
								<TableCell>{dayjs(account.createdAt).format("DD/MM/YYYY HH:mm")}</TableCell>
								<TableCell>{dayjs(account.updatedAt).format("DD/MM/YYYY HH:mm")}</TableCell>
								<TableCell>{account.updatedByName || account.updatedBy}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</form>
	);
};
