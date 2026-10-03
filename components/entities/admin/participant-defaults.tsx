import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useFetchCollectors } from "@/api/endpoints/back-office/collectors/fetch-collectors";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { useFetchInsurers } from "@/api/endpoints/back-office/insurers/fetch-insurers";
import { useFetchParticipantDefaults } from "@/api/endpoints/back-office/participant-defaults/fetch-participant-defaults";
import { useUpsertParticipantDefaults } from "@/api/endpoints/back-office/participant-defaults/upsert-participant-defaults.api";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
import { IParticipantDefaults } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { AutoCompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface ParticipantDefaultsProps {
	id: number;
	type: IParticipantDefaults["participantType"];
}

export const ParticipantDefaults = (props: ParticipantDefaultsProps) => {
	const { id, type } = props;

	const { t } = useTranslationContext();

	const [isEditing, setIsEditing] = useState(false);
	const [supplierSearch, setSupplierSearch] = useState("");
	const [insurerSearch, setInsurerSearch] = useState("");
	const [financierSearch, setFinancierSearch] = useState("");
	const [collectorSearch, setCollectorSearch] = useState("");
	const [offerSearch, setOfferSearch] = useState("");

	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { data: suppliersData, isLoading: isSuppliersLoading } = useFetchSuppliers();
	const { data: financiersData, isLoading: isFinanciersLoading } = useFetchFinanciers();
	const { data: insurersData, isLoading: isInsurersLoading } = useFetchInsurers();
	const { data: collectorsData, isLoading: isCollectorsLoading } = useFetchCollectors();

	const { mutate, isPending } = useUpsertParticipantDefaults({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["back-office", "participant-defaults", String(id)],
			});
		},
		onSuccess: () => {
			setIsEditing(false);
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, setValues } = useForm<{
		participantType: "financier" | "collector" | "insurer" | "bwadl" | "supplier" | "buyer";
		participantId: number;

		financierOfferId?: number;
		collectorId?: number;
		insurerId?: number;
		// create endpoint to fetch
		bwadlId?: number;
		supplierId?: number;

		financierId?: number;
	}>({
		initialValues: {
			participantId: id,
			participantType: type,
		},
		onSubmit: values => {
			mutate(values);
		},

		validate(values) {
			const errors: Record<string, string> = {};

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	const { data, isLoading } = useFetchParticipantDefaults(
		{ id, type },
		{
			select: data => {
				if (data.participantDefaults) setValues(data.participantDefaults);

				return data;
			},
		},
	);

	const financier = financiersData?.financiers.find(
		f =>
			f.id === values.financierId ||
			f.financierSupplierContracts.some(c => c.financierOffers.some(o => o.id === values.financierOfferId)),
	);
	const offers =
		financier?.financierSupplierContracts
			.filter(fsc => fsc.supplierId === (type === "supplier" ? id : values.supplierId))
			.flatMap(contract =>
				contract.financierOffers.map(offer => ({
					label: offer.offerName,
					value: offer.id,
				})),
			) ?? [];

	useEffect(() => {
		setFieldValue("financierId", financier ? financier.id : undefined);
	}, [financier]);

	const labelClassName = isEditing ? "text-sm font-medium text-[#404040]" : "text-sm text-[#9CA3AF]";
	const inputClassName = isEditing ? "text-[#404040]" : "text-[#9CA3AF]";

	return (
		<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
			<div className="flex items-end justify-between">
				<label className="font-bold">{t("admin.participant-defaults.participant-defaults")}</label>
				{isEditing ? (
					<div className="flex items-center gap-2">
						<Button
							disabled={isPending}
							size="sm"
							type="button"
							variant="destructive"
							onClick={() => {
								const financier = financiersData?.financiers.find(
									f =>
										f.id === values.financierId ||
										f.financierSupplierContracts.some(c =>
											c.financierOffers.some(o => o.id === values.financierOfferId),
										),
								);
								setValues({
									bwadlId: data?.participantDefaults?.bwadlId,
									collectorId: data?.participantDefaults?.collectorId,
									financierId: financier?.id,
									financierOfferId: data?.participantDefaults?.financierOfferId,
									insurerId: data?.participantDefaults?.insurerId,
									participantId: id,
									participantType: type,
									supplierId: data?.participantDefaults?.supplierId,
								});
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
					<Button size="sm" type="button" onClick={() => setIsEditing(true)} disabled={isLoading}>
						<Icon className="h-4 w-4 fill-white" name="Edit" />
						{t("admin.common.edit")}
					</Button>
				)}
			</div>

			<div className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-md bg-[#EFF5F9] p-6">
				{type !== "supplier" && (
					<AutoCompleteInput
						isLoading={isSuppliersLoading}
						items={
							suppliersData?.suppliers.map(supplier => ({
								label: `${supplier.supplierName} (${supplier.crNumber})`,
								value: supplier.id,
							})) ?? []
						}
						label={t("admin.participant-defaults.supplier")}
						labelClassName={labelClassName}
						inputClassName={inputClassName}
						placeholder={t("admin.participant-defaults.search-supplier-placeholder")}
						searchValue={supplierSearch}
						selectedValue={values.supplierId}
						onSearchValueChange={setSupplierSearch}
						onSelectedValueChange={value => {
							setFieldValue("supplierId", value);
							setFieldValue("financierOfferId", undefined);
							setOfferSearch("");
						}}
						readOnly={!isEditing}
						onClear={() => {
							setFieldValue("supplierId", undefined);
							setFieldValue("financierOfferId", undefined);
							setOfferSearch("");
							setSupplierSearch("");
						}}
					/>
				)}

				{type !== "financier" && (
					<AutoCompleteInput
						isLoading={isFinanciersLoading}
						items={
							financiersData?.financiers.map(financier => ({
								label: `${financier.financierName} (${financier.crNumber})`,
								value: financier.id,
							})) ?? []
						}
						label={t("admin.participant-defaults.financier")}
						labelClassName={labelClassName}
						inputClassName={inputClassName}
						placeholder={t("admin.participant-defaults.search-financier-placeholder")}
						searchValue={financierSearch}
						selectedValue={values.financierId}
						onSearchValueChange={setFinancierSearch}
						onSelectedValueChange={value => {
							setFieldValue("financierId", value);
							setFieldValue("financierOfferId", undefined);
							setOfferSearch("");
						}}
						readOnly={!isEditing}
						onClear={() => {
							setFieldValue("financierId", undefined);
							setFieldValue("financierOfferId", undefined);
							setOfferSearch("");
							setFinancierSearch("");
						}}
					/>
				)}

				{type !== "insurer" && (
					<AutoCompleteInput
						isLoading={isInsurersLoading}
						items={
							insurersData?.insurers.map(insurer => ({
								label: `${insurer.insurerName} (${insurer.crNumber})`,
								value: insurer.id,
							})) ?? []
						}
						label={t("admin.participant-defaults.insurer")}
						labelClassName={labelClassName}
						inputClassName={inputClassName}
						placeholder={t("admin.participant-defaults.search-insurer-placeholder")}
						searchValue={insurerSearch}
						selectedValue={values.insurerId}
						onSearchValueChange={setInsurerSearch}
						onSelectedValueChange={value => setFieldValue("insurerId", value)}
						readOnly={!isEditing}
						onClear={() => setFieldValue("insurerId", undefined)}
					/>
				)}

				{type !== "collector" && (
					<AutoCompleteInput
						isLoading={isCollectorsLoading}
						items={
							collectorsData?.collectors.map(collector => ({
								label: `${collector.collectorName} (${collector.crNumber})`,
								value: collector.id,
							})) ?? []
						}
						label={t("admin.participant-defaults.collector")}
						labelClassName={labelClassName}
						inputClassName={inputClassName}
						placeholder={t("admin.participant-defaults.search-collector-placeholder")}
						searchValue={collectorSearch}
						selectedValue={values.collectorId}
						onSearchValueChange={setCollectorSearch}
						onSelectedValueChange={value => setFieldValue("collectorId", value)}
						readOnly={!isEditing}
						onClear={() => setFieldValue("collectorId", undefined)}
					/>
				)}

				{type !== "financier" && (
					<AutoCompleteInput
						items={offers}
						label={t("admin.participant-defaults.offer")}
						labelClassName={labelClassName}
						inputClassName={inputClassName}
						placeholder={t("admin.participant-defaults.search-offer-placeholder")}
						searchValue={offerSearch}
						selectedValue={values.financierOfferId}
						onSearchValueChange={setOfferSearch}
						onSelectedValueChange={value => setFieldValue("financierOfferId", value)}
						readOnly={!isEditing}
						onClear={() => setFieldValue("financierOfferId", undefined)}
						disabled={(!values.supplierId && type !== "supplier") || !values.financierId}
					/>
				)}
			</div>
		</form>
	);
};
