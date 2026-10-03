"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFetchBankEntities } from "@/api/endpoints/back-office/banks/fetch-bank-entities";
import { IBankEntity } from "@/api/types";
import { BankEditPopUp, BanksHeader } from "@/components/entities/admin/dashboard/banks";
import { FormattedNumber } from "@/components/global/formatted-number";
import { HighlightText } from "@/components/global/highlight-text";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable, DataTableHeaders } from "@/components/ui/data-table";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

export default function Page() {
	const params = useSearchParams();
	const setParams = useSetParams();
	const { t } = useTranslationContext();

	const [editingBank, setEditingBank] = useState<IBankEntity | null>(null);

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const q = params.get("search") || "";

	const { data, isLoading } = useFetchBankEntities({
		limit: pageSize,
		page,
		q,
	});

	const headers: DataTableHeaders<IBankEntity> = [
		{
			key: "bankName",
			label: t("admin.banks.bank-name"),
			render: (value, row) => (
				<div className="flex flex-col gap-0.5">
					<span className="font-semibold text-gray-900">
						<HighlightText query={q} text={String(value ?? "")} />
					</span>
					<span className="text-xs text-gray-400">
						{row.isActive ? t("admin.banks.active") : t("admin.banks.inactive")}
					</span>
				</div>
			),
		},
		{
			key: "bankCode",
			label: t("admin.banks.bank-code"),
			render: value => (
				<span className="text-sm font-medium tracking-wide text-gray-700 uppercase">
					<HighlightText query={q} text={String(value ?? "")} />
				</span>
			),
		},
		{
			key: "shortName",
			label: t("admin.banks.short-name"),
			render: value => (
				<span className="text-sm font-medium text-gray-700">
					<HighlightText query={q} text={String(value ?? "")} />
				</span>
			),
		},
		{
			groupEnd: true,
			key: "accountCode",
			label: t("admin.banks.account-code"),
			render: value => (
				<span className="font-mono text-xs text-gray-600">
					<HighlightText query={q} text={String(value ?? "")} />
				</span>
			),
		},
		{
			key: "accountNumber",
			label: t("admin.banks.account-number"),
			render: value => (
				<span className={cn("font-mono text-xs", value ? "text-gray-700" : "text-gray-300")}>
					{value ? String(value) : "-"}
				</span>
			),
		},
		{
			key: "iban",
			label: t("admin.banks.iban"),
			render: value => (
				<span className={cn("font-mono text-xs", value ? "text-gray-700" : "text-gray-300")}>
					{value ? String(value) : "-"}
				</span>
			),
		},
		{
			alignment: "right",
			groupEnd: true,
			key: "balance",
			label: <RiyalTitle>{t("admin.banks.balance")}</RiyalTitle>,
			render: (value, row) => (
				<div className="flex flex-col items-end gap-0.5">
					<FormattedNumber
						className={cn("tabular-nums font-semibold", Number(value) < 0 ? "text-[#B3261E]" : "text-gray-900")}
						value={value ?? 0}
					/>
					{row.currencyCode && <span className="text-[11px] text-gray-400">{row.currencyCode}</span>}
				</div>
			),
		},
		{
			key: "createdBy",
			label: t("admin.banks.created-by"),
			render: (value, row) => <span className="text-gray-700">{row.createdByName || String(value || "-")}</span>,
		},
		{
			key: "createdAt",
			label: t("admin.banks.created-at"),
			render: value => (
				<div className="flex flex-col gap-0.5">
					<span className="text-gray-900">{value ? dayjs(String(value)).format("DD/MM/YYYY") : "-"}</span>
					{value && <span className="text-xs text-gray-400">{dayjs(String(value)).fromNow()}</span>}
				</div>
			),
		},
		{
			key: "updatedBy",
			label: t("admin.banks.updated-by"),
			render: (value, row) => <span className="text-gray-700">{row.updatedByName || String(value || "-")}</span>,
		},
		{
			key: "updatedAt",
			label: t("admin.banks.updated-at"),
			render: value => (
				<div className="flex flex-col gap-0.5">
					<span className="text-gray-900">{value ? dayjs(String(value)).format("DD/MM/YYYY") : "-"}</span>
					{value && <span className="text-xs text-gray-400">{dayjs(String(value)).fromNow()}</span>}
				</div>
			),
		},
	];

	return (
		<>
			<BreadcrumbTitles crumbs={[{ position: 0, title: t("admin.banks.list-of-banks") }]} />

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<BanksHeader />

				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-400">
						{t("admin.banks.total-banks", { count: data?.totalCount ?? 0 })}
					</span>
				</div>

				<div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
					<DataTable
						className="flex-1"
						data={data?.banks}
						headers={headers}
						groupHeaders={[
							{ label: t("admin.banks.group-bank"), span: 4 },
							{ label: t("admin.banks.group-account-details"), span: 3 },
							{ label: t("admin.banks.group-audit-trail"), span: 4 },
						]}
						stickyFirstColumn
						striped
						loading={isLoading}
						emptyMessage={t("admin.banks.no-banks-found")}
						onEdit={row => setEditingBank(row)}
					/>
				</div>

				<Pagination
					currentCount={data?.banks.length}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={data?.totalCount}
					setPerPage={pageSize => setParams({ page: null, pageSize })}
					showing
				/>
			</div>

			{editingBank && (
				<BankEditPopUp
					bank={editingBank}
					open
					onOpenChange={open => {
						if (!open) setEditingBank(null);
					}}
				/>
			)}
		</>
	);
}
