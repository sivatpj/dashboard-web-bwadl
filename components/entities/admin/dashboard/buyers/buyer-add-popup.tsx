"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateBuyer } from "@/api/endpoints/back-office/buyers/create-buyer.api";
import { useFetchCollectors } from "@/api/endpoints/back-office/collectors/fetch-collectors";
import { useFetchInsurers } from "@/api/endpoints/back-office/insurers/fetch-insurers";
import { useUpsertParticipantDefaults } from "@/api/endpoints/back-office/participant-defaults/upsert-participant-defaults.api";
import { IParticipantAccount } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { AutoCompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { CrNumberInput } from "@/components/ui/cr-number-input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { isValidSaudiMobile, MobileInput } from "@/components/ui/mobile-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";
import { SelectSupplierPopUp } from "./buyer-select-reference";

interface BuyerAddPopUpProps {}

export const BuyerAddPopUp = (props: BuyerAddPopUpProps) => {
	const {} = props;

	const [open, setOpen] = useState(false);
	const [collectorSearch, setCollectorSearch] = useState("");
	const [insurerSearch, setInsurerSearch] = useState("");

	const { t } = useTranslationContext();
	const { toast } = useToast();

	const queryClient = useQueryClient();

	const { data: insurersData } = useFetchInsurers({}, { enabled: open });
	const { data: collectorsData } = useFetchCollectors({}, { enabled: open });

	const { mutate: upsertParticipantDefaults } = useUpsertParticipantDefaults({
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "participant-defaults"] });
		},
	});

	const { mutate, isPending } = useCreateBuyer({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "buyers"] });
		},
		onSuccess: data => {
			if (values.defaultCollectorId || values.defaultInsurerId) {
				upsertParticipantDefaults({
					collectorId: values.defaultCollectorId || undefined,
					insurerId: values.defaultInsurerId || undefined,
					participantId: data.buyer.id,
					participantType: "buyer",
				});
			}

			setOpen(false);
			resetForm();
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		crNumber: number | undefined;
		facilityName: string;
		buyerName: string;
		creditLimit: number;
		repaymentPeriod: number;
		installmentNumber: number;
		contactNumber: string;
		emailAddress: string;
		buyerCategory: string;
		additionalInfo?: any;
		references: IParticipantAccount[];
		defaultCollectorId: number;
		defaultInsurerId: number;
	}>({
		initialValues: {
			additionalInfo: {},
			buyerCategory: String(),
			buyerName: String(),
			contactNumber: String(),
			creditLimit: 20000,
			crNumber: undefined,
			defaultCollectorId: Number(),
			defaultInsurerId: Number(),
			emailAddress: String(),
			facilityName: String(),
			installmentNumber: 0,
			references: [],
			repaymentPeriod: 0,
		},
		onSubmit: values => {
			const { defaultCollectorId, defaultInsurerId, ...rest } = values;

			mutate({
				...rest,
				additionalInfo: {
					...values.additionalInfo,
					buyerCategory: values.buyerCategory,
					email: values.emailAddress,
					phone: values.contactNumber,
				},
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.crNumber) {
				errors.crNumber = t("admin.buyers.validation.cr-number-required");
			} else if (!/^\d{10}$/.test(values.crNumber.toString())) {
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
			if (values.contactNumber && !isValidSaudiMobile(values.contactNumber)) {
				errors.contactNumber = t("admin.buyers.validation.contact-number");
			}
			if (
				values.repaymentPeriod > 0 &&
				values.installmentNumber > 0 &&
				values.repaymentPeriod < values.installmentNumber
			) {
				errors.repaymentPeriod = t("admin.buyers.validation.repayment-period-min-installments");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<Dialog
			open={open}
			onOpenChange={value => {
				setOpen(value);
				if (!value) resetForm();
			}}
		>
			<DialogTrigger asChild>
				<Button className="w-48" onClick={() => setOpen(true)}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.buyers.add-new-buyer")}
				</Button>
			</DialogTrigger>

			<DialogContent className="flex max-h-[calc(100vh-2rem)] w-[min(90vw,1300px)] flex-col  bg-[#F0F8FD] p-0">
				<form className="flex min-h-0 w-full flex-col gap-6 p-6 sm:p-8" noValidate onSubmit={handleSubmit}>
					<div className="shrink-0">
						<h2 className="text-2xl font-bold text-[#404040]">{t("admin.buyers.add-new-buyer")}</h2>
						<h3 className="text-[#141919]">{t("admin.buyers.add-new-buyer-form")}</h3>
					</div>

					<div className="grid min-h-0 flex-1 grid-cols-1 gap-x-10 gap-y-5 overflow-y-auto pr-2 lg:grid-cols-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#B7C6D1] [&::-webkit-scrollbar-track]:bg-transparent">
						<CrNumberInput
							error={errors.crNumber}
							label={t("admin.buyers.cr-number")}
							placeholder={t("admin.buyers.cr-number-placeholder")}
							value={values.crNumber}
							onChange={value => setFieldValue("crNumber", value)}
						/>

						<Input
							error={errors.facilityName}
							label={t("admin.buyers.facility-name")}
							placeholder={t("admin.buyers.facility-name-placeholder")}
							value={values.facilityName}
							onChange={e => setFieldValue("facilityName", e.target.value)}
						/>

						<Input
							error={errors.buyerName}
							label={t("admin.buyers.buyer-name")}
							placeholder={t("admin.buyers.buyer-name-placeholder")}
							value={values.buyerName}
							onChange={e => setFieldValue("buyerName", e.target.value)}
						/>

						<AmountInput
							error={errors.creditLimit}
							label={t("admin.buyers.credit-limit")}
							placeholder={t("admin.buyers.credit-limit-placeholder")}
							value={values.creditLimit}
							onChange={value => setFieldValue("creditLimit", value)}
						/>

						<MobileInput
							error={errors.contactNumber}
							label={t("admin.buyers.contact-number")}
							placeholder={t("admin.buyers.contact-number")}
							value={values.contactNumber}
							onChange={e => setFieldValue("contactNumber", e.target.value)}
						/>

						<Input
							label={t("admin.buyers.email-address")}
							placeholder={t("admin.buyers.email-address")}
							type="email"
							value={values.emailAddress}
							onChange={e => setFieldValue("emailAddress", e.target.value)}
						/>

						<Input
							error={errors.repaymentPeriod}
							icon={t("admin.buyers.days")}
							label={t("admin.buyers.repayment-period")}
							min={0}
							placeholder={t("admin.buyers.repayment-period-placeholder")}
							type="number"
							value={values.repaymentPeriod === 0 ? "" : values.repaymentPeriod}
							onChange={e => setFieldValue("repaymentPeriod", Number(e.target.value))}
						/>

						<Input
							error={errors.installmentNumber}
							label={t("admin.buyers.number-of-installments")}
							min={0}
							placeholder={t("admin.buyers.number-of-installments-placeholder")}
							type="number"
							value={values.installmentNumber === 0 ? "" : values.installmentNumber}
							onChange={e => setFieldValue("installmentNumber", Number(e.target.value))}
						/>

						<SelectSupplierPopUp
							trigger={
								<Button className="w-[45%] font-semibold" type="button">
									{t("admin.buyers.select-participant")}
								</Button>
							}
							values={values.references}
							onSelect={references => setFieldValue("references", references)}
						/>

						<AutoCompleteInput
							items={(collectorsData?.collectors ?? []).map(collector => ({
								label: collector.collectorName,
								value: collector.id,
							}))}
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

						<div className="flex flex-col gap-6">
							<Select
								label={t("admin.buyers.buyer-category")}
								value={values.buyerCategory}
								onValueChange={value => setFieldValue("buyerCategory", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("admin.buyers.select-category")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="retail">Retail</SelectItem>
									<SelectItem value="restaurant">Restaurant</SelectItem>
									<SelectItem value="wholesale">Wholesale</SelectItem>
								</SelectContent>
							</Select>

							<Input
								label={t("admin.buyers.comments")}
								placeholder={t("admin.buyers.comments-placeholder")}
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

					<div className="flex shrink-0 flex-col justify-end gap-2 border-t border-[#D5E1E9] pt-4 sm:flex-row">
						<Button
							className="w-full px-16 font-semibold sm:w-auto"
							type="button"
							variant="outline"
							onClick={() => {
								resetForm();
								setOpen(false);
							}}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button className="w-full px-16 font-semibold sm:w-auto" disabled={isPending} type="submit">
							{t("admin.buyers.add-buyer")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
