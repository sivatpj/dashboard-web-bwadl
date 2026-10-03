"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useFetchAccountsByParticipant } from "@/api/endpoints/back-office/accounting/fetch-accounts";
import { useFetchTransferPurposeTypes } from "@/api/endpoints/back-office/banks/transfer-purpose-types.api";
import { useFetchBuyers } from "@/api/endpoints/back-office/buyers/fetch-buyers";
import { useFetchCollectors } from "@/api/endpoints/back-office/collectors/fetch-collectors";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { useFetchInsurers } from "@/api/endpoints/back-office/insurers/fetch-insurers";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
import { useAccountInternalTransfer } from "@/api/endpoints/back-office/transfers/account-internal-transfer.api";
import { TransferPurposeTypeManagePopup } from "@/components/entities/admin/dashboard/transfers/transfer-purpose-type-filter";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { AutoCompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

type ParticipantType = "supplier" | "buyer" | "insurer" | "collector" | "financier" | "bwadl";

const BWADL_PARTICIPANT_ITEMS = [{ label: "Bwadl", value: 1 }];

export const InternalTransferPopUp = ({ onSuccess: onSuccessProp }: { onSuccess?: () => void } = {}) => {
	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();
	const { t } = useTranslationContext();
	const { toast } = useToast();

	const [fromParticipantSearchInput, setFromParticipantSearchInput] = useState("");
	const [fromParticipantSearch, setFromParticipantSearch] = useState("");
	const [fromAccountSearchInput, setFromAccountSearchInput] = useState("");

	const [toParticipantSearchInput, setToParticipantSearchInput] = useState("");
	const [toParticipantSearch, setToParticipantSearch] = useState("");
	const [toAccountSearchInput, setToAccountSearchInput] = useState("");

	const debouncedFromParticipantSearch = useDebouncedCallback((value: string) => {
		setFromParticipantSearch(value.trim());
	}, 300);

	const debouncedToParticipantSearch = useDebouncedCallback((value: string) => {
		setToParticipantSearch(value.trim());
	}, 300);

	const skipFromParticipantSearchUpdateRef = useRef(false);
	const skipFromAccountSearchUpdateRef = useRef(false);
	const skipToParticipantSearchUpdateRef = useRef(false);
	const skipToAccountSearchUpdateRef = useRef(false);

	useEffect(() => {
		return () => {
			debouncedFromParticipantSearch.cancel();
			debouncedToParticipantSearch.cancel();
		};
	}, [debouncedFromParticipantSearch, debouncedToParticipantSearch]);

	const { mutate: internalTransfer, isPending: isTransferring } = useAccountInternalTransfer({
		onError: err => {
			toast({
				description: err.response?.data.details || err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				exact: false,
				queryKey: ["back-office", "accounting", "accounts"],
			});
		},
		onSuccess: () => {
			setOpen(false);
			resetForm();
			onSuccessProp?.();
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		fromParticipantType: ParticipantType;
		fromParticipantId: number;
		fromAccountCode: string;
		toParticipantType: ParticipantType;
		toParticipantId: number;
		toAccountCode: string;
		amount: number;
		currencyCode: string;
		referenceNumber?: string;
		notes: string;
		purposeTypeId: number;
	}>({
		initialValues: {
			amount: 0,
			currencyCode: "SAR",
			fromAccountCode: "",
			fromParticipantId: 0,
			fromParticipantType: "supplier",
			notes: "",
			purposeTypeId: 0,
			referenceNumber: undefined,
			toAccountCode: "",
			toParticipantId: 0,
			toParticipantType: "supplier",
		},
		onSubmit: formValues => {
			const payload = {
				amount: formValues.amount,
				currencyCode: formValues.currencyCode || "SAR",
				fromAccountCode: formValues.fromAccountCode,
				fromParticipantId: formValues.fromParticipantId,
				fromParticipantType: formValues.fromParticipantType,
				notes: formValues.notes,
				purposeTypeId: formValues.purposeTypeId,
				referenceNumber: formValues.referenceNumber || undefined,
				toAccountCode: formValues.toAccountCode,
				toParticipantId: formValues.toParticipantId,
				toParticipantType: formValues.toParticipantType,
			};

			internalTransfer(payload);
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.fromParticipantType) {
				errors.fromParticipantType = t("admin.transfers.validation.from-participant-type");
			}
			if (!values.fromParticipantId) {
				errors.fromParticipantId = t("admin.transfers.validation.from-participant");
			}
			if (!values.fromAccountCode) {
				errors.fromAccountCode = t("admin.transfers.validation.from-account-code");
			}
			if (!values.toParticipantType) {
				errors.toParticipantType = t("admin.transfers.validation.to-participant-type");
			}
			if (!values.toParticipantId) {
				errors.toParticipantId = t("admin.transfers.validation.to-participant");
			}
			if (!values.toAccountCode) {
				errors.toAccountCode = t("admin.transfers.validation.to-account-code");
			}
			if (!values.amount || values.amount <= 0) {
				errors.amount = t("admin.transfers.validation.amount");
			}
			if (!values.purposeTypeId) {
				errors.purposeTypeId = t("admin.transfers.validation.purpose-type");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	// From Participant Queries
	const fromSuppliersQuery = useFetchSuppliers(
		values.fromParticipantType === "supplier" ? { limit: 20, q: fromParticipantSearch } : undefined,
		{ enabled: values.fromParticipantType === "supplier" },
	);
	const fromBuyersQuery = useFetchBuyers(
		values.fromParticipantType === "buyer" ? { limit: 20, q: fromParticipantSearch } : undefined,
		{ enabled: values.fromParticipantType === "buyer" },
	);
	const fromInsurersQuery = useFetchInsurers(
		values.fromParticipantType === "insurer" ? { limit: 20, q: fromParticipantSearch } : undefined,
		{ enabled: values.fromParticipantType === "insurer" },
	);
	const fromCollectorsQuery = useFetchCollectors(
		values.fromParticipantType === "collector" ? { limit: 20, q: fromParticipantSearch } : undefined,
		{ enabled: values.fromParticipantType === "collector" },
	);
	const fromFinanciersQuery = useFetchFinanciers(
		values.fromParticipantType === "financier" ? { limit: 20, q: fromParticipantSearch } : undefined,
		{ enabled: values.fromParticipantType === "financier" },
	);

	// To Participant Queries
	const toSuppliersQuery = useFetchSuppliers(
		values.toParticipantType === "supplier" ? { limit: 20, q: toParticipantSearch } : undefined,
		{ enabled: values.toParticipantType === "supplier" },
	);
	const toBuyersQuery = useFetchBuyers(
		values.toParticipantType === "buyer" ? { limit: 20, q: toParticipantSearch } : undefined,
		{ enabled: values.toParticipantType === "buyer" },
	);
	const toInsurersQuery = useFetchInsurers(
		values.toParticipantType === "insurer" ? { limit: 20, q: toParticipantSearch } : undefined,
		{ enabled: values.toParticipantType === "insurer" },
	);
	const toCollectorsQuery = useFetchCollectors(
		values.toParticipantType === "collector" ? { limit: 20, q: toParticipantSearch } : undefined,
		{ enabled: values.toParticipantType === "collector" },
	);
	const toFinanciersQuery = useFetchFinanciers(
		values.toParticipantType === "financier" ? { limit: 20, q: toParticipantSearch } : undefined,
		{ enabled: values.toParticipantType === "financier" },
	);

	const purposeTypesQuery = useFetchTransferPurposeTypes();

	// Account Queries
	const fromAccountsQuery = useFetchAccountsByParticipant(
		values.fromParticipantId || undefined,
		values.fromParticipantType,
		{},
		{ enabled: Boolean(values.fromParticipantId) },
	);
	const toAccountsQuery = useFetchAccountsByParticipant(
		values.toParticipantId || undefined,
		values.toParticipantType,
		{},
		{ enabled: Boolean(values.toParticipantId) },
	);

	const fromAccountItems =
		fromAccountsQuery.data?.accounts.map(a => ({
			label: a.accountCode,
			value: a.accountCode,
		})) ?? [];

	const toAccountItems =
		toAccountsQuery.data?.accounts.map(a => ({
			label: a.accountCode,
			value: a.accountCode,
		})) ?? [];

	const fromParticipantItems = (() => {
		switch (values.fromParticipantType) {
			case "supplier":
				return (
					fromSuppliersQuery.data?.suppliers.map(s => ({
						label: s.supplierName,
						value: s.id,
					})) ?? []
				);
			case "buyer":
				return (
					fromBuyersQuery.data?.buyers.map(b => ({
						label: b.buyerName,
						value: b.id,
					})) ?? []
				);
			case "insurer":
				return (
					fromInsurersQuery.data?.insurers.map(i => ({
						label: i.insurerName,
						value: i.id,
					})) ?? []
				);
			case "collector":
				return (
					fromCollectorsQuery.data?.collectors.map(c => ({
						label: c.collectorName,
						value: c.id,
					})) ?? []
				);
			case "financier":
				return (
					fromFinanciersQuery.data?.financiers.map(f => ({
						label: f.financierName,
						value: f.id,
					})) ?? []
				);
			case "bwadl":
				return BWADL_PARTICIPANT_ITEMS;
			default:
				return [];
		}
	})();

	const toParticipantItems = (() => {
		switch (values.toParticipantType) {
			case "supplier":
				return (
					toSuppliersQuery.data?.suppliers.map(s => ({
						label: s.supplierName,
						value: s.id,
					})) ?? []
				);
			case "buyer":
				return (
					toBuyersQuery.data?.buyers.map(b => ({
						label: b.buyerName,
						value: b.id,
					})) ?? []
				);
			case "insurer":
				return (
					toInsurersQuery.data?.insurers.map(i => ({
						label: i.insurerName,
						value: i.id,
					})) ?? []
				);
			case "collector":
				return (
					toCollectorsQuery.data?.collectors.map(c => ({
						label: c.collectorName,
						value: c.id,
					})) ?? []
				);
			case "financier":
				return (
					toFinanciersQuery.data?.financiers.map(f => ({
						label: f.financierName,
						value: f.id,
					})) ?? []
				);
			case "bwadl":
				return BWADL_PARTICIPANT_ITEMS;
			default:
				return [];
		}
	})();

	const isFromParticipantsLoading =
		values.fromParticipantType === "supplier"
			? !!fromSuppliersQuery.isPending
			: values.fromParticipantType === "buyer"
				? !!fromBuyersQuery.isPending
				: values.fromParticipantType === "insurer"
					? !!fromInsurersQuery.isPending
					: values.fromParticipantType === "collector"
						? !!fromCollectorsQuery.isPending
						: values.fromParticipantType === "financier"
							? !!fromFinanciersQuery.isPending
							: false;

	const isToParticipantsLoading =
		values.toParticipantType === "supplier"
			? !!toSuppliersQuery.isPending
			: values.toParticipantType === "buyer"
				? !!toBuyersQuery.isPending
				: values.toParticipantType === "insurer"
					? !!toInsurersQuery.isPending
					: values.toParticipantType === "collector"
						? !!toCollectorsQuery.isPending
						: values.toParticipantType === "financier"
							? !!toFinanciersQuery.isPending
							: false;

	const handleFromParticipantSearchChange = (value: string) => {
		setFromParticipantSearchInput(value);
		if (skipFromParticipantSearchUpdateRef.current) {
			skipFromParticipantSearchUpdateRef.current = false;
			return;
		}
		debouncedFromParticipantSearch(value);
	};

	const handleFromParticipantSelect = (value: number) => {
		skipFromParticipantSearchUpdateRef.current = true;
		const selectedLabel = fromParticipantItems.find(item => item.value === value)?.label ?? "";
		setFieldValue("fromParticipantId", value || 0);
		setFromParticipantSearchInput(selectedLabel);
		debouncedFromParticipantSearch.cancel();
		setFromParticipantSearch("");
		skipFromAccountSearchUpdateRef.current = false;
		setFieldValue("fromAccountCode", "");
		setFromAccountSearchInput("");
	};

	const handleFromAccountSearchChange = (value: string) => {
		setFromAccountSearchInput(value);
		if (skipFromAccountSearchUpdateRef.current) {
			skipFromAccountSearchUpdateRef.current = false;
			return;
		}
	};

	const handleFromAccountSelect = (value: string) => {
		skipFromAccountSearchUpdateRef.current = true;
		const selectedLabel = fromAccountItems.find(item => item.value === value)?.label ?? "";
		setFieldValue("fromAccountCode", value ?? "");
		setFromAccountSearchInput(selectedLabel);
	};

	const handleToParticipantSearchChange = (value: string) => {
		setToParticipantSearchInput(value);
		if (skipToParticipantSearchUpdateRef.current) {
			skipToParticipantSearchUpdateRef.current = false;
			return;
		}
		debouncedToParticipantSearch(value);
	};

	const handleToParticipantSelect = (value: number) => {
		skipToParticipantSearchUpdateRef.current = true;
		const selectedLabel = toParticipantItems.find(item => item.value === value)?.label ?? "";
		setFieldValue("toParticipantId", value || 0);
		setToParticipantSearchInput(selectedLabel);
		debouncedToParticipantSearch.cancel();
		setToParticipantSearch("");
		skipToAccountSearchUpdateRef.current = false;
		setFieldValue("toAccountCode", "");
		setToAccountSearchInput("");
	};

	const handleToAccountSearchChange = (value: string) => {
		setToAccountSearchInput(value);
		if (skipToAccountSearchUpdateRef.current) {
			skipToAccountSearchUpdateRef.current = false;
			return;
		}
	};

	const handleToAccountSelect = (value: string) => {
		skipToAccountSearchUpdateRef.current = true;
		const selectedLabel = toAccountItems.find(item => item.value === value)?.label ?? "";
		setFieldValue("toAccountCode", value ?? "");
		setToAccountSearchInput(selectedLabel);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				setOpen(nextOpen);
				if (!nextOpen) {
					resetForm();
					debouncedFromParticipantSearch.cancel();
					debouncedToParticipantSearch.cancel();
					skipFromParticipantSearchUpdateRef.current = false;
					skipFromAccountSearchUpdateRef.current = false;
					skipToParticipantSearchUpdateRef.current = false;
					skipToAccountSearchUpdateRef.current = false;
					setFromParticipantSearchInput("");
					setFromParticipantSearch("");
					setFromAccountSearchInput("");
					setToParticipantSearchInput("");
					setToParticipantSearch("");
					setToAccountSearchInput("");
				}
			}}
		>
			<DialogTrigger asChild>
				<Button className="w-48" onClick={() => setOpen(true)}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.transfers.internal-transfer")}
				</Button>
			</DialogTrigger>

			<DialogContent className="w-full max-w-[95vw] sm:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[65vw] bg-[#F0F8FD] p-0">
				<form
					className="relative flex flex-col justify-between rounded-[10px] bg-[#F0F8FD] px-4 py-6 sm:px-8 sm:py-8 lg:px-10 shadow-lg gap-6 max-h-[90vh] overflow-y-auto"
					onSubmit={handleSubmit}
				>
					<div>
						<h2 className="text-xl sm:text-2xl font-bold">{t("admin.transfers.internal-transfer")}</h2>
						<p className="text-muted-foreground text-sm sm:text-base">{t("admin.transfers.internal-transfer-description")}</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 items-start gap-x-6 lg:gap-x-16 xl:gap-x-24 gap-y-4 sm:gap-y-6">
						{/* From Section */}
						<div className="col-span-1 sm:col-span-2">
							<h3 className="text-lg font-semibold mb-4">{t("admin.transfers.from")}</h3>
						</div>

						<Select
							label={t("admin.transfers.from-participant-type")}
							value={values.fromParticipantType}
							onValueChange={value => {
								setFieldValue("fromParticipantType", value as ParticipantType);
								setFieldValue("fromParticipantId", 0);
								debouncedFromParticipantSearch.cancel();
								skipFromParticipantSearchUpdateRef.current = false;
								setFromParticipantSearchInput("");
								setFromParticipantSearch("");
								setFieldValue("fromAccountCode", "");
								skipFromAccountSearchUpdateRef.current = false;
								setFromAccountSearchInput("");
							}}
						>
							<SelectTrigger error={errors.fromParticipantType}>
								<SelectValue placeholder={t("admin.transfers.from-participant-type")} />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="supplier">{t("admin.statements.supplier")}</SelectItem>
								<SelectItem value="buyer">{t("admin.statements.buyer")}</SelectItem>
								<SelectItem value="insurer">{t("admin.statements.insurer")}</SelectItem>
								<SelectItem value="collector">{t("admin.statements.collector")}</SelectItem>
								<SelectItem value="financier">{t("admin.statements.financier")}</SelectItem>
								<SelectItem value="bwadl">{t("admin.statements.platform")}</SelectItem>
							</SelectContent>
						</Select>

						<AutoCompleteInput
							emptyMessage={t("admin.statements.no-results")}
							isLoading={isFromParticipantsLoading}
							items={fromParticipantItems}
							label={t("admin.transfers.from-participant")}
							placeholder={t("admin.transfers.from-participant")}
							searchValue={fromParticipantSearchInput}
							selectedValue={values.fromParticipantId}
							onSearchValueChange={handleFromParticipantSearchChange}
							onSelectedValueChange={handleFromParticipantSelect}
						/>

						<AutoCompleteInput
							emptyMessage={t("admin.statements.no-results")}
							isLoading={fromAccountsQuery.isPending}
							items={fromAccountItems}
							label={t("admin.transfers.from-account-code")}
							placeholder={t("admin.transfers.from-account-code")}
							searchValue={fromAccountSearchInput}
							selectedValue={values.fromAccountCode}
							onSearchValueChange={handleFromAccountSearchChange}
							onSelectedValueChange={handleFromAccountSelect}
						/>

						{/* To Section */}
						<div className="col-span-1 sm:col-span-2">
							<h3 className="text-lg font-semibold mb-4 mt-4">{t("admin.transfers.to")}</h3>
						</div>

						<Select
							label={t("admin.transfers.to-participant-type")}
							value={values.toParticipantType}
							onValueChange={value => {
								setFieldValue("toParticipantType", value as ParticipantType);
								setFieldValue("toParticipantId", 0);
								debouncedToParticipantSearch.cancel();
								skipToParticipantSearchUpdateRef.current = false;
								setToParticipantSearchInput("");
								setToParticipantSearch("");
								setFieldValue("toAccountCode", "");
								skipToAccountSearchUpdateRef.current = false;
								setToAccountSearchInput("");
							}}
						>
							<SelectTrigger error={errors.toParticipantType}>
								<SelectValue placeholder={t("admin.transfers.to-participant-type")} />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="supplier">{t("admin.statements.supplier")}</SelectItem>
								<SelectItem value="buyer">{t("admin.statements.buyer")}</SelectItem>
								<SelectItem value="insurer">{t("admin.statements.insurer")}</SelectItem>
								<SelectItem value="collector">{t("admin.statements.collector")}</SelectItem>
								<SelectItem value="financier">{t("admin.statements.financier")}</SelectItem>
								<SelectItem value="bwadl">{t("admin.statements.platform")}</SelectItem>
							</SelectContent>
						</Select>

						<AutoCompleteInput
							emptyMessage={t("admin.statements.no-results")}
							isLoading={isToParticipantsLoading}
							items={toParticipantItems}
							label={t("admin.transfers.to-participant")}
							placeholder={t("admin.transfers.to-participant")}
							searchValue={toParticipantSearchInput}
							selectedValue={values.toParticipantId}
							onSearchValueChange={handleToParticipantSearchChange}
							onSelectedValueChange={handleToParticipantSelect}
						/>

						<AutoCompleteInput
							emptyMessage={t("admin.statements.no-results")}
							isLoading={toAccountsQuery.isPending}
							items={toAccountItems}
							label={t("admin.transfers.to-account-code")}
							placeholder={t("admin.transfers.to-account-code")}
							searchValue={toAccountSearchInput}
							selectedValue={values.toAccountCode}
							onSearchValueChange={handleToAccountSearchChange}
							onSelectedValueChange={handleToAccountSelect}
						/>

						{/* Amount */}
						<div className="col-span-1 sm:col-span-2">
							<h3 className="text-lg font-semibold mb-4 mt-4">{t("admin.transfers.transfer-details")}</h3>
						</div>

						<AmountInput
							error={errors.amount}
							label={t("admin.transfers.amount")}
							placeholder={t("admin.transfers.amount")}
							value={values.amount}
							onChange={value => setFieldValue("amount", value)}
						/>

						<div className="flex w-full flex-col gap-1">
							<label className="text-sm text-[#404040]">
								{t("admin.transfers.purpose-type")}
								<span className="text-red-500"> *</span>
							</label>
							<div className="flex items-stretch gap-2">
								<Select
									className="flex-1"
									value={values.purposeTypeId ? String(values.purposeTypeId) : ""}
									onValueChange={value => setFieldValue("purposeTypeId", Number(value))}
								>
									<SelectTrigger error={errors.purposeTypeId}>
										<SelectValue placeholder={t("admin.transfers.purpose-type")} />
									</SelectTrigger>

									<SelectContent>
										{purposeTypesQuery.data?.purposeTypes.map(purposeType => (
											<SelectItem key={purposeType.id} value={String(purposeType.id)}>
												{purposeType.purposeType}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<TransferPurposeTypeManagePopup />
							</div>
						</div>

						<Input
							className="sm:col-span-2"
							error={errors.notes}
							label={t("admin.transfers.notes")}
							placeholder={t("admin.transfers.notes")}
							value={values.notes}
							onChange={e => setFieldValue("notes", e.target.value)}
						/>
					</div>

					<div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
						<Button
							className="w-full sm:w-[200px] bg-[#969696] hover:bg-[#808080]"
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							{t("admin.common.cancel")}
						</Button>
						<Button className="w-full sm:w-[200px] bg-black hover:bg-gray-900" loading={isTransferring} type="submit">
							{t("admin.transfers.internal-transfer")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
