"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFetchAccountingAccounts } from "@/api/endpoints/back-office/accounting/fetch-accounts";
import { IAccount } from "@/api/types";
import { AccountTypePill } from "@/components/entities/admin/dashboard/accounts/account-type-pill";
import { EditOverdraftDialog } from "@/components/entities/admin/dashboard/accounts/edit-overdraft-dialog";
import { FormattedNumber } from "@/components/global/formatted-number";
import { HighlightText } from "@/components/global/highlight-text";
import { Icon } from "@/components/global/icon";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable, DataTableHeaders } from "@/components/ui/data-table";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

dayjs.extend(relativeTime);

export default function Page() {
	const params = useSearchParams();
	const setParams = useSetParams();
	const { t } = useTranslationContext();

	const [editingAccount, setEditingAccount] = useState<IAccount | null>(null);

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const q = params.get("search") || "";

	const setDebouncedSearch = useDebouncedCallback(value => setParams({ page: null, search: value }), 1000);

	const { data: accountsData, isPending: isAccountsLoading } = useFetchAccountingAccounts({
		limit: pageSize,
		page,
		q,
	});

	// isOverdraftEditable is a FE-only concern: overdraft is editable when an account
	// has a "cash" purpose participant mapping that isn't a buyer.
	const accounts: IAccount[] = (accountsData?.accounts ?? []).map(({ account, participantAccounts }) => ({
		...account,
		isOverdraftEditable: participantAccounts.some(
			participant => participant.purpose === "cash" && participant.participantType !== "buyer",
		),
	}));

	const headers: DataTableHeaders<IAccount> = [
		{
			key: "accountCode",
			label: t("admin.accounts.account-code"),
			render: value => (
				<span className="text-sm font-medium text-gray-900">
					<HighlightText query={q} text={String(value ?? "")} />
				</span>
			),
		},
		{
			key: "accountType",
			label: t("admin.accounts.account-type"),
			render: (_, row) => <AccountTypePill type={row.accountType} />,
		},
		{
			key: "accountName",
			label: t("admin.accounts.account-name"),
			render: value => (
				<span className="font-medium text-gray-900">
					<HighlightText query={q} text={String(value ?? "")} />
				</span>
			),
		},
		{
			groupEnd: true,
			key: "accountDescription",
			label: t("admin.accounts.account-description"),
			render: value => (
				<span className="block max-w-[240px] truncate text-gray-500" title={value ? String(value) : undefined}>
					{value ? String(value) : "-"}
				</span>
			),
		},
		{
			alignment: "right",
			key: "balance",
			label: <RiyalTitle>{t("admin.accounts.balance")}</RiyalTitle>,
			render: (value, row) => (
				<div className="flex flex-col items-end gap-0.5">
					<FormattedNumber
						className={cn("tabular-nums font-semibold", Number(value) < 0 && "text-[#D32F2F]")}
						value={value}
					/>
					<span className="text-[11px] text-gray-400">{row.currencyCode}</span>
				</div>
			),
		},
		{
			alignment: "center",
			key: "allowsOverdraft",
			label: t("admin.accounts.allows-overdraft"),
			render: value => (
				<span
					className={cn(
						"inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
						value ? "bg-[#E1FCEF] text-[#38A06C]" : "bg-[#F0F0F0] text-gray-500",
					)}
				>
					<span className={cn("size-1.5 rounded-full", value ? "bg-[#38A06C]" : "bg-gray-400")} />
					{value ? t("admin.accounts.yes") : t("admin.accounts.no")}
				</span>
			),
		},
		{
			alignment: "right",
			groupEnd: true,
			key: "overdraftLimit",
			label: t("admin.accounts.overdraft-limit"),
			render: (value, row) => (
				<FormattedNumber
					className={cn("tabular-nums", !row.allowsOverdraft && "text-gray-300")}
					value={value ?? 0}
				/>
			),
		},
		{
			key: "createdAt",
			label: t("admin.accounts.created-at"),
			render: value => (
				<div className="flex flex-col gap-0.5">
					<span className="text-gray-900">{value ? dayjs(String(value)).format("DD/MM/YYYY") : "-"}</span>
					{value && <span className="text-xs text-gray-400">{dayjs(String(value)).fromNow()}</span>}
				</div>
			),
		},
		{
			key: "createdBy",
			label: t("admin.accounts.created-by"),
			render: (value, row) => <span className="text-gray-700">{row.createdByName || String(value || "-")}</span>,
		},
		{
			key: "updatedAt",
			label: t("admin.accounts.updated-at"),
			render: value => (
				<div className="flex flex-col gap-0.5">
					<span className="text-gray-900">{value ? dayjs(String(value)).format("DD/MM/YYYY") : "-"}</span>
					{value && <span className="text-xs text-gray-400">{dayjs(String(value)).fromNow()}</span>}
				</div>
			),
		},
		{
			key: "updatedBy",
			label: t("admin.accounts.updated-by"),
			render: (value, row) => <span className="text-gray-700">{row.updatedByName || String(value || "-")}</span>,
		},
	];

	return (
		<>
			<BreadcrumbTitles crumbs={[{ position: 0, title: t("admin.sidebar.accounts") }]} />

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
					<Input
						className="w-full sm:w-[50%]"
						defaultValue={q}
						icon={<Icon className="h-4 w-4" name="Search" />}
						iconPosition="right"
						placeholder={t("admin.accounts.search-placeholder")}
						type="text"
						onChange={e => setDebouncedSearch(e.target.value)}
					/>
					<span className="whitespace-nowrap text-sm text-gray-400">
						{t("admin.accounts.total-accounts", { count: accountsData?.totalCount || 0 })}
					</span>
				</div>

				<div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
					<DataTable
						className="flex-1"
						data={accounts}
						headers={headers}
						groupHeaders={[
							{ label: t("admin.accounts.group-account"), span: 4 },
							{ label: t("admin.accounts.group-financials"), span: 3 },
							{ label: t("admin.accounts.group-audit-trail"), span: 4 },
						]}
						stickyFirstColumn
						striped
						loading={isAccountsLoading}
						hasRowActions={row => Boolean(row.isOverdraftEditable)}
						renderEditAction={row =>
							row.isOverdraftEditable ? (
								<DropdownMenuItem
									className="flex items-center gap-3 px-4 py-2.5"
									onClick={event => event.stopPropagation()}
									onSelect={event => {
										event.stopPropagation();
										setEditingAccount(row);
									}}
								>
									<Icon className="h-4 w-4" name="EditPopup" />
									{t("admin.common.edit")}
								</DropdownMenuItem>
							) : null
						}
					/>
				</div>

				<Pagination
					currentCount={accounts.length}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={accountsData?.totalCount || 0}
					setPerPage={pageSize => setParams({ page: null, pageSize })}
					showing
				/>
			</div>

			<EditOverdraftDialog
				account={editingAccount}
				open={!!editingAccount}
				onOpenChange={open => !open && setEditingAccount(null)}
			/>
		</>
	);
}
