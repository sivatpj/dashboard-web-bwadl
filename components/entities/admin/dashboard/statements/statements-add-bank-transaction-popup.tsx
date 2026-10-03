"use client";

import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { usePersistBank } from "@/api/endpoints/back-office/banks/persist-bank.api";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { AutoCompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input-txn";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";

export const AddBankTransactionPopup = () => {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();
	const { t } = useTranslationContext();

	const [financierSearchInput, setFinancierSearchInput] = useState("");
	const [financierSearch, setFinancierSearch] = useState("");
	const skipFinancierSearchUpdateRef = useRef(false);

	const debouncedFinancierSearch = useDebouncedCallback((value: string) => {
		setFinancierSearch(value.trim());
	}, 300);

	const financiersQuery = useFetchFinanciers({ limit: 20, q: financierSearch });
	const financierItems =
		financiersQuery.data?.financiers.map(f => ({
			label: f.financierName,
			value: f.id,
		})) ?? [];

	const { mutate: persistBank, isPending } = usePersistBank({
		onSettled: () => {
			queryClient.invalidateQueries({
				exact: false,
				queryKey: ["back-office", "banks"],
			});
		},
		onSuccess: () => {
			setOpen(false);
			resetForm();
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		date: string;
		capital: number;
		transferred: number;
		expenses: number;
		description: string;
		bankBalance: number;
		financierId: number;
	}>({
		initialValues: {
			bankBalance: 0,
			capital: 0,
			date: "",
			description: "",
			expenses: 0,
			financierId: 0,
			transferred: 0,
		},
		onSubmit: formValues => {
			persistBank({
				bankBalance: formValues.bankBalance,
				capital: formValues.capital,
				date: dayjs(formValues.date).format("YYYY-MM-DD"),
				description: formValues.description || undefined,
				expenses: formValues.expenses,
				financierId: formValues.financierId,
				transferred: formValues.transferred,
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.date) {
				errors.date = t("admin.statements.validation.date");
			}
			if (!values.financierId) {
				errors.financierId = t("admin.statements.validation.financier");
			}
			if (values.capital < 0) {
				errors.capital = t("admin.statements.validation.capital");
			}
			if (values.transferred < 0) {
				errors.transferred = t("admin.statements.validation.transferred");
			}
			if (values.expenses < 0) {
				errors.expenses = t("admin.statements.validation.expenses");
			}
			if (values.bankBalance < 0) {
				errors.bankBalance = t("admin.statements.validation.bank-balance");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	const handleFinancierSearchChange = (value: string) => {
		setFinancierSearchInput(value);
		if (skipFinancierSearchUpdateRef.current) {
			skipFinancierSearchUpdateRef.current = false;
			return;
		}
		debouncedFinancierSearch(value);
	};

	const handleFinancierSelect = (value: number) => {
		skipFinancierSearchUpdateRef.current = true;
		const selectedLabel = financierItems.find(item => item.value === value)?.label ?? "";
		setFieldValue("financierId", value || 0);
		setFinancierSearchInput(selectedLabel);
		debouncedFinancierSearch.cancel();
		setFinancierSearch("");
	};

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				setOpen(nextOpen);
				if (!nextOpen) {
					resetForm();
					debouncedFinancierSearch.cancel();
					skipFinancierSearchUpdateRef.current = false;
					setFinancierSearchInput("");
					setFinancierSearch("");
				}
			}}
		>
			<DialogTrigger asChild>
				<Button className="w-48" onClick={() => setOpen(true)}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.statements.add-transaction")}
				</Button>
			</DialogTrigger>

			<DialogContent className="w-[80%] bg-[#F0F8FD] p-0">
				<form
					className="relative flex flex-col justify-between rounded-[10px] bg-[#F0F8FD] px-10 py-8 shadow-lg gap-6"
					onSubmit={handleSubmit}
				>
					<div>
						<h2 className="text-2xl font-bold">{t("admin.statements.add-new-bank-transaction")}</h2>
						<p className="text-muted-foreground">{t("admin.statements.add-new-bank-transaction-description")}</p>
					</div>

					<div className="grid grid-cols-2 items-start gap-x-24 gap-y-6">
						<div className="col-span-1">
							<DateInput
								error={errors.date}
								label={t("admin.statements.transaction-date")}
								placeholder={t("admin.statements.transaction-date")}
								value={values.date}
								onChange={value => setFieldValue("date", value)}
							/>
						</div>

						<AutoCompleteInput
							emptyMessage={t("admin.statements.no-results")}
							error={errors.financierId}
							isLoading={financiersQuery.isPending}
							items={financierItems}
							label={t("admin.statements.financier")}
							placeholder={t("admin.statements.select-financier")}
							searchValue={financierSearchInput}
							selectedValue={values.financierId}
							onSearchValueChange={handleFinancierSearchChange}
							onSelectedValueChange={handleFinancierSelect}
						/>

						<AmountInput
							error={errors.capital}
							label={t("admin.statements.new-capital-amount")}
							placeholder={t("admin.statements.new-capital-amount-placeholder")}
							value={values.capital}
							onChange={value => setFieldValue("capital", value)}
						/>

						<AmountInput
							error={errors.transferred}
							label={t("admin.statements.transferred")}
							placeholder={t("admin.statements.transferred-amount-placeholder")}
							value={values.transferred}
							onChange={value => setFieldValue("transferred", value)}
						/>

						<AmountInput
							error={errors.expenses}
							label={t("admin.statements.expenses")}
							placeholder={t("admin.statements.expenses-placeholder")}
							value={values.expenses}
							onChange={value => setFieldValue("expenses", value)}
						/>

						<Select
							label={t("admin.statements.expenses-type")}
							value={values.description}
							onValueChange={value => setFieldValue("description", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("admin.statements.expenses-type-placeholder")} />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="fees">{t("admin.statements.expenses-type-fees")}</SelectItem>
								<SelectItem value="other">{t("admin.statements.expenses-type-other")}</SelectItem>
							</SelectContent>
						</Select>

						<AmountInput
							error={errors.bankBalance}
							label={t("admin.statements.bank-balance")}
							placeholder={t("admin.statements.bank-balance-placeholder")}
							value={values.bankBalance}
							onChange={value => setFieldValue("bankBalance", value)}
						/>
					</div>

					<div className="flex justify-end gap-4">
						<Button
							className="w-[200px] bg-[#969696] hover:bg-[#808080]"
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							{t("admin.common.cancel")}
						</Button>
						<Button className="w-[200px] bg-black hover:bg-gray-900" loading={isPending} type="submit">
							{t("admin.statements.add-transaction")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
