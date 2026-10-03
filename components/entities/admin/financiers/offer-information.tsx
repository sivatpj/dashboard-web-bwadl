"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useUpdateFinancierOffer } from "@/api/endpoints/back-office/financiers/financier-offers/update-financier-offer.api";
import { IFinancierOffer } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface OfferInformationProps {
	offer: IFinancierOffer;
	financierId: number;
}

export const OfferInformation = (props: OfferInformationProps) => {
	const { offer, financierId } = props;

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [isEditing, setIsEditing] = useState(false);

	const { mutate, isPending } = useUpdateFinancierOffer(
		{ id: offer.id },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: ["back-office", "financiers", String(financierId)] });
			},
			onSuccess: () => {
				setIsEditing(false);
			},
		},
	);

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		financierSupplierContractId: number;
		offerUniqueReference: string;
		offerName: string;
		financingDateOffsetDays: number;
		financierShare: number;
		bwadlShare: number;
		financierCancellationFees: number;
		supplierAdvancePercentage: number;
		comments: string;
	}>({
		initialValues: {
			bwadlShare: offer.bwadlShare,
			comments: offer.additionalInfo?.comments || "",
			financierCancellationFees: offer.financierCancellationFees,
			financierShare: offer.financierShare,
			financierSupplierContractId: offer.financierSupplierContractsId,
			financingDateOffsetDays: offer.financingDateOffsetDays,
			offerName: offer.offerName,
			offerUniqueReference: offer.offerUniqueReference,
			supplierAdvancePercentage: offer.supplierAdvancePercentage,
		},
		onSubmit: formValues => {
			mutate({
				...formValues,
				bwadlCancellationFees: offer.bwadlCancellationFees,
				collectorCancellationFees: offer.collectorCancellationFees,
				collectorShare: offer.collectorShare,
				deliveryDateOffsetDays: offer.deliveryDateOffsetDays,
				financingDateOffsetFrom: offer.financingDateOffsetFrom,
				installmentNumber: offer.installmentNumber,
				insurerCancellationFees: offer.insurerCancellationFees,
				insurerShare: offer.insurerShare,
				isPreDeliveryOnly: offer.isPreDeliveryOnly,
				paymentDateOffsetDays: offer.paymentDateOffsetDays ?? 0,
				postDeliveryFinancierDiscount: offer.postDeliveryFinancierDiscount,
				repaymentPeriod: offer.repaymentPeriod,
				supplierCancellationFees: offer.supplierCancellationFees,
				supplierShare: offer.supplierShare,
			});
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
			<div className="flex items-end justify-between">
				<label className="font-bold">{t("admin.financiers.offer-details")}</label>

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
						{t("admin.financiers.edit")}
					</Button>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4 rounded-md bg-[#EFF5F9] p-4">
				<Input
					disabled={!isEditing}
					error={errors.offerName}
					label={t("admin.financiers.offer-name")}
					placeholder={t("admin.financiers.offer-name-placeholder")}
					type="text"
					value={values.offerName}
					onChange={e => setFieldValue("offerName", e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.financiers.offer-unique-reference")}
					placeholder={t("admin.financiers.offer-unique-reference-placeholder")}
					type="text"
					value={values.offerUniqueReference}
					onChange={e => setFieldValue("offerUniqueReference", e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.financiers.financing-date-offset")}
					placeholder={t("admin.financiers.financing-date-offset-placeholder")}
					type="number"
					value={values.financingDateOffsetDays}
					onChange={e => setFieldValue("financingDateOffsetDays", +e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.financiers.financial-share")}
					min={0}
					placeholder={t("admin.financiers.financial-share-placeholder")}
					step="any"
					type="number"
					value={values.financierShare}
					onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
					onChange={e => setFieldValue("financierShare", +e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.financiers.accounting-fees")}
					min={0}
					placeholder={t("admin.financiers.accounting-fees-placeholder")}
					step="any"
					type="number"
					value={values.bwadlShare}
					onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
					onChange={e => setFieldValue("bwadlShare", +e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.financiers.accounting-cancellation-fees")}
					min={0}
					placeholder={t("admin.financiers.accounting-cancellation-fees-placeholder")}
					step="any"
					type="number"
					value={values.financierCancellationFees}
					onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
					onChange={e => setFieldValue("financierCancellationFees", +e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.financiers.supplier-advance-percentage")}
					max={100}
					min={0}
					placeholder={t("admin.financiers.supplier-advance-percentage-placeholder")}
					step="any"
					type="number"
					value={values.supplierAdvancePercentage}
					onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
					onChange={e => setFieldValue("supplierAdvancePercentage", +e.target.value)}
				/>

				<Input
					disabled={!isEditing}
					label={t("admin.financiers.comments")}
					placeholder={t("admin.financiers.comments-placeholder")}
					type="text"
					value={values.comments}
					onChange={e => setFieldValue("comments", e.target.value)}
				/>
			</div>
		</form>
	);
};
