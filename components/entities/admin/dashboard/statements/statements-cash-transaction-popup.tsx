"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useFetchAccountsByParticipant } from "@/api/endpoints/back-office/accounting/fetch-accounts";
import { useAccountCashIn, useAccountCashOut } from "@/api/endpoints/back-office/banks/account-cash.api";
import { useFetchBankAccounts, useFetchBankReferenceAccounts } from "@/api/endpoints/back-office/banks/fetch-bank-accounts";
import { useFetchTransferPurposeTypes } from "@/api/endpoints/back-office/banks/transfer-purpose-types.api";
import { useFetchBuyers } from "@/api/endpoints/back-office/buyers/fetch-buyers";
import { useFetchCollectors } from "@/api/endpoints/back-office/collectors/fetch-collectors";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
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

type ParticipantType = "supplier" | "buyer" | "collector" | "financier" | "bwadl";

const BWADL_PARTICIPANT_ITEMS = [{ label: "Bwadl", value: 1 }];

export const TransactionsAddTransactionPopUp = ({ onSuccess: onSuccessProp }: { onSuccess?: () => void } = {}) => {
	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();
	const { t } = useTranslationContext();
	const { toast } = useToast();

	const [participantSearchInput, setParticipantSearchInput] = useState("");
	const [participantSearch, setParticipantSearch] = useState("");
	const [accountSearchInput, setAccountSearchInput] = useState("");
	const [bankSearchInput, setBankSearchInput] = useState("");

	const debouncedParticipantSearch = useDebouncedCallback((value: string) => {
		setParticipantSearch(value.trim());
	}, 300);

	const skipParticipantSearchUpdateRef = useRef(false);
	const skipAccountSearchUpdateRef = useRef(false);
	const skipBankSearchUpdateRef = useRef(false);

	useEffect(() => {
		return () => {
			debouncedParticipantSearch.cancel();
		};
	}, [debouncedParticipantSearch]);

	const handleTransactionCreated = async () => {
		setOpen(false);
		resetForm();
		await queryClient.invalidateQueries({ queryKey: ["back-office", "accounting", "transactions"] });
		await queryClient.refetchQueries({ queryKey: ["back-office", "accounting", "transactions"], type: "active" });
		onSuccessProp?.();
	};

	const { mutate: cashIn, isPending: isCashIn } = useAccountCashIn({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
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
		onSuccess: handleTransactionCreated,
	});

	const { mutate: cashOut, isPending: isCashOut } = useAccountCashOut({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
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
		onSuccess: handleTransactionCreated,
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		participantType: ParticipantType;
		participantId: number;
		amount: number;
		transactionType: "cash-in" | "cash-out";
		accountCode: string;
		bankAccountCode: string;
		referenceNumber?: string;
		currencyCode: string;
		notes: string;
		purposeTypeId: number;
	}>({
		initialValues: {
			accountCode: "",
			amount: 0,
			bankAccountCode: "",
			currencyCode: "SAR",
			notes: "",
			participantId: 0,
			participantType: "supplier",
			purposeTypeId: 0,
			referenceNumber: undefined,
			transactionType: "cash-in",
		},
		onSubmit: formValues => {
			const payload = {
				accountCode: formValues.accountCode,
				amount: formValues.amount,
				bankAccountCode: formValues.bankAccountCode,
				currencyCode: formValues.currencyCode || "SAR",
				notes: formValues.notes.trim() || "-",
				participantId: formValues.participantId,
				participantType: formValues.participantType,
				purposeTypeId: formValues.purposeTypeId || undefined,
				referenceNumber: formValues.referenceNumber || undefined,
			};

			if (formValues.transactionType === "cash-out") {
				cashOut(payload);
			} else {
				cashIn(payload);
			}
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.participantType) {
				errors.participantType = t("admin.statements.validation.participant-type");
			}
			if (!values.participantId) {
				errors.participantId = t("admin.statements.validation.participant");
			}
			if (!values.amount || values.amount <= 0) {
				errors.amount = t("admin.statements.validation.amount");
			}
			if (!values.accountCode) {
				errors.accountCode = t("admin.statements.validation.account-code");
			}
			if (!values.bankAccountCode) {
				errors.bankAccountCode = t("admin.statements.validation.bank-account-code");
			}
			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	const suppliersQuery = useFetchSuppliers(
		values.participantType === "supplier" ? { limit: 20, q: participantSearch } : undefined,
		{ enabled: values.participantType === "supplier" },
	);
	const buyersQuery = useFetchBuyers(
		values.participantType === "buyer" ? { limit: 20, q: participantSearch } : undefined,
		{ enabled: values.participantType === "buyer" },
	);
	const collectorsQuery = useFetchCollectors(
		values.participantType === "collector" ? { limit: 20, q: participantSearch } : undefined,
		{ enabled: values.participantType === "collector" },
	);
	const financiersQuery = useFetchFinanciers(
		values.participantType === "financier" ? { limit: 20, q: participantSearch } : undefined,
		{ enabled: values.participantType === "financier" },
	);

	const purposeTypesQuery = useFetchTransferPurposeTypes();

	const accountsQuery = useFetchAccountsByParticipant(
		values.participantId || undefined,
		values.participantType,
		{},
		{ enabled: Boolean(values.participantId) },
	);
	const accountItems =
		accountsQuery.data?.accounts
			.filter(a => a.isCurrent && a.purpose === "cash")
			.map(a => ({
				label: a.accountCode,
				value: a.accountCode,
			})) ?? [];

	const isMappableParticipant = values.participantType === "supplier" || values.participantType === "financier";

	const bankAccountsQuery = useFetchBankAccounts();
	const bankReferenceQuery = useFetchBankReferenceAccounts(
		values.participantId || undefined,
		isMappableParticipant ? values.participantType : undefined,
	);

	const allBankItems =
		bankAccountsQuery.data?.banks.map(b => ({
			label: b.shortName || b.bankName || b.accountCode,
			value: b.accountCode,
		})) ?? [];
	const mappedBankItems =
		bankReferenceQuery.data?.references.map(r => ({
			label: r.shortName || r.bankName || r.accountCode,
			value: r.accountCode,
		})) ?? [];

	const bankItems = isMappableParticipant && mappedBankItems.length ? mappedBankItems : allBankItems;
	const isBanksLoading =
		bankAccountsQuery.isPending || (isMappableParticipant && Boolean(values.participantId) && bankReferenceQuery.isPending);

	const participantItems = (() => {
		switch (values.participantType) {
			case "supplier":
				return (
					suppliersQuery.data?.suppliers.map(s => ({
						label: s.supplierName,
						value: s.id,
					})) ?? []
				);
			case "buyer":
				return (
					buyersQuery.data?.buyers.map(b => ({
						label: b.buyerName,
						value: b.id,
					})) ?? []
				);
			case "collector":
				return (
					collectorsQuery.data?.collectors.map(c => ({
						label: c.collectorName,
						value: c.id,
					})) ?? []
				);
			case "financier":
				return (
					financiersQuery.data?.financiers.map(f => ({
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

	const isParticipantsLoading =
		values.participantType === "supplier"
			? !!suppliersQuery.isPending
			: values.participantType === "buyer"
				? !!buyersQuery.isPending
				: values.participantType === "collector"
					? !!collectorsQuery.isPending
					: values.participantType === "financier"
						? !!financiersQuery.isPending
						: false;

	const handleParticipantSearchChange = (value: string) => {
		setParticipantSearchInput(value);
		if (skipParticipantSearchUpdateRef.current) {
			skipParticipantSearchUpdateRef.current = false;
			return;
		}
		debouncedParticipantSearch(value);
	};

	const handleParticipantSelect = (value: number) => {
		skipParticipantSearchUpdateRef.current = true;
		const selectedLabel = participantItems.find(item => item.value === value)?.label ?? "";
		setFieldValue("participantId", value || 0);
		setParticipantSearchInput(selectedLabel);
		debouncedParticipantSearch.cancel();
		setParticipantSearch("");
		skipAccountSearchUpdateRef.current = false;
		setFieldValue("accountCode", "");
		setAccountSearchInput("");
		skipBankSearchUpdateRef.current = false;
		setFieldValue("bankAccountCode", "");
		setBankSearchInput("");
	};

	const handleAccountSearchChange = (value: string) => {
		setAccountSearchInput(value);
		if (skipAccountSearchUpdateRef.current) {
			skipAccountSearchUpdateRef.current = false;
			return;
		}
	};

	const handleAccountSelect = (value: string) => {
		skipAccountSearchUpdateRef.current = true;
		const selectedLabel = accountItems.find(item => item.value === value)?.label ?? "";
		setFieldValue("accountCode", value ?? "");
		setAccountSearchInput(selectedLabel);
	};

	const handleBankSearchChange = (value: string) => {
		setBankSearchInput(value);
		if (skipBankSearchUpdateRef.current) {
			skipBankSearchUpdateRef.current = false;
			return;
		}
	};

	const handleBankSelect = (value: string) => {
		skipBankSearchUpdateRef.current = true;
		const selectedLabel = bankItems.find(item => item.value === value)?.label ?? "";
		setFieldValue("bankAccountCode", value ?? "");
		setBankSearchInput(selectedLabel);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				setOpen(nextOpen);
				if (!nextOpen) {
					resetForm();
					debouncedParticipantSearch.cancel();
					skipParticipantSearchUpdateRef.current = false;
					skipAccountSearchUpdateRef.current = false;
					skipBankSearchUpdateRef.current = false;
					setParticipantSearchInput("");
					setParticipantSearch("");
					setAccountSearchInput("");
					setBankSearchInput("");
				}
			}}
		>
			<DialogTrigger asChild>
				<Button className="w-48" onClick={() => setOpen(true)}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.statements.cash-transaction")}
				</Button>
			</DialogTrigger>

			<DialogContent className="w-full max-w-[95vw] sm:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[65vw] bg-[#F0F8FD] p-0">
				<form
					className="relative flex flex-col justify-between rounded-[10px] bg-[#F0F8FD] px-4 py-6 sm:px-8 sm:py-8 lg:px-10 shadow-lg gap-6 max-h-[90vh] overflow-y-auto"
					onSubmit={handleSubmit}
				>
					<div>
						<h2 className="text-xl sm:text-2xl font-bold">{t("admin.statements.cash-transaction")}</h2>
						<p className="text-muted-foreground text-sm sm:text-base">{t("admin.statements.cash-transaction-description")}</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 items-start gap-x-6 lg:gap-x-16 xl:gap-x-24 gap-y-4 sm:gap-y-6">
						<Select
							label={t("admin.statements.participant-type")}
							value={values.participantType}
							onValueChange={value => {
								setFieldValue("participantType", value as ParticipantType);
								setFieldValue("participantId", 0);
								debouncedParticipantSearch.cancel();
								skipParticipantSearchUpdateRef.current = false;
								setParticipantSearchInput("");
								setParticipantSearch("");
								setFieldValue("accountCode", "");
								skipAccountSearchUpdateRef.current = false;
								setAccountSearchInput("");
								setFieldValue("bankAccountCode", "");
								skipBankSearchUpdateRef.current = false;
								setBankSearchInput("");
							}}
						>
							<SelectTrigger error={errors.participantType}>
								<SelectValue placeholder={t("admin.statements.participant-type")} />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="supplier">{t("admin.statements.supplier")}</SelectItem>
								<SelectItem value="buyer">{t("admin.statements.buyer")}</SelectItem>
								<SelectItem value="collector">{t("admin.statements.collector")}</SelectItem>
								<SelectItem value="financier">{t("admin.statements.financier")}</SelectItem>
								<SelectItem value="bwadl">{t("admin.statements.platform")}</SelectItem>
							</SelectContent>
						</Select>

						<AutoCompleteInput
							emptyMessage={t("admin.statements.no-results")}
							isLoading={isParticipantsLoading}
							items={participantItems}
							label={t("admin.statements.participant")}
							placeholder={t("admin.statements.participant")}
							searchValue={participantSearchInput}
							selectedValue={values.participantId}
							onSearchValueChange={handleParticipantSearchChange}
							onSelectedValueChange={handleParticipantSelect}
						/>

						<AutoCompleteInput
							emptyMessage={t("admin.statements.no-results")}
							error={errors.bankAccountCode}
							isLoading={isBanksLoading}
							items={bankItems}
							label={t("admin.statements.bank")}
							placeholder={t("admin.statements.bank")}
							searchValue={bankSearchInput}
							selectedValue={values.bankAccountCode}
							onSearchValueChange={handleBankSearchChange}
							onSelectedValueChange={handleBankSelect}
						/>

						<AmountInput
							error={errors.amount}
							label={t("admin.statements.amount")}
							placeholder={t("admin.statements.amount")}
							value={values.amount}
							onChange={value => setFieldValue("amount", value)}
						/>

						<AutoCompleteInput
							emptyMessage={t("admin.statements.no-results")}
							isLoading={accountsQuery.isPending}
							items={accountItems}
							label={t("admin.statements.account-code")}
							placeholder={t("admin.statements.account-code")}
							searchValue={accountSearchInput}
							selectedValue={values.accountCode}
							onSearchValueChange={handleAccountSearchChange}
							onSelectedValueChange={handleAccountSelect}
						/>

						<Select
							label={t("admin.statements.transaction-type")}
							value={values.transactionType}
							onValueChange={value => setFieldValue("transactionType", value as "cash-in" | "cash-out")}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("admin.statements.transaction-type")} />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="cash-in">{t("admin.statements.cash-in")}</SelectItem>
								<SelectItem value="cash-out">{t("admin.statements.cash-out")}</SelectItem>
							</SelectContent>
						</Select>

						<Select
							label={t("admin.statements.purpose-type")}
							value={values.purposeTypeId ? String(values.purposeTypeId) : ""}
							onValueChange={value => setFieldValue("purposeTypeId", Number(value))}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("admin.statements.purpose-type")} />
							</SelectTrigger>

							<SelectContent>
								{purposeTypesQuery.data?.purposeTypes.map(purposeType => (
									<SelectItem key={purposeType.id} value={String(purposeType.id)}>
										{purposeType.purposeType}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Input
							className="sm:col-span-2"
							error={errors.notes}
							label={t("admin.statements.notes")}
							placeholder={t("admin.statements.notes")}
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
						<Button className="w-full sm:w-[200px] bg-black hover:bg-gray-900" loading={isCashIn || isCashOut} type="submit">
							{t("admin.statements.cash-transaction")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
