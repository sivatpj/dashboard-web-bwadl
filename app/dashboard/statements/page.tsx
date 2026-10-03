"use client";

import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetchAccountsForStatement } from "@/api/endpoints/back-office/accounting/fetch-accounts";
import { StatementsHeader } from "@/components/entities/admin/dashboard/statements";
import { FormattedNumber } from "@/components/global/formatted-number";
import { HighlightText } from "@/components/global/highlight-text";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

export default function Page(props: PageProps<"/dashboard/statements">) {
	const params = useSearchParams();
	const router = useRouter();
	const setParams = useSetParams();
	const { t } = useTranslationContext();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const q = params.get("search") || "";
	const sortBy = params.get("sortBy") || "";
	const sortOrder = (params.get("sortOrder") || "asc") as "asc" | "desc";

	const from = params.get("from") || undefined;
	const to = params.get("to") || undefined;

	const { data: accountsData, isPending: isAccountsLoading } = useFetchAccountsForStatement({
		from,
		limit: pageSize,
		page,
		q,
		sortBy,
		sortOrder,
		to,
	});

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.statements.statements"),
					},
					{
						position: 1,
						title: accountsData?.accounts?.[0]?.accountCode ?? "",
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<StatementsHeader />

				<DataTable
					className="flex-1"
					data={accountsData?.accounts}
					headers={[
						{
							key: "accountCode",
							label: t("admin.statements.account-code"),
							sortable: true,
							render: value => <HighlightText query={q} text={String(value ?? "")} />,
						},
						{
							key: "accountType",
							label: t("admin.statements.account-type"),
							render: value => <HighlightText query={q} text={String(value ?? "")} />,
						},
						{
							key: "accountName",
							label: t("admin.statements.account-name"),
							sortable: true,
							render: value => <HighlightText query={q} text={String(value ?? "")} />,
						},
						{ key: "currencyCode", label: t("admin.statements.currency"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
						{
							key: "updatedAt",
							label: t("admin.statements.transaction-date"),
							render: (_, row) => {
								const date = row.updatedAt || row.createdAt;
								return date ? dayjs(date).format("DD/MM/YYYY") : "-";
							},
							sortable: true,
						},
						{
							alignment: "right",
							key: "balance",
							label: <RiyalTitle>{t("admin.statements.balance")}</RiyalTitle>,
							render: value => <FormattedNumber value={value} />,
							sortable: true,
						},
						/* {
							alignment: "right",
							key: "holdBalance",
							label: <RiyalTitle>{t("admin.statements.hold-balance")}</RiyalTitle>,
							render: value => <FormattedNumber value={value} />,
							sortable: true,
						}, */
						/* {
							alignment: "right",
							key: "availableBalance",
							label: <RiyalTitle>{t("admin.statements.available-balance")}</RiyalTitle>,
							render: value => <FormattedNumber value={value} />,
							sortable: true,
						}, */
						{
							key: "closedAt",
							label: t("admin.statements.closed-at"),
							render: value => (value ? dayjs(value).format("DD/MM/YYYY") : t("admin.statements.active")),
							sortable: true,
						},
					]}
					loading={isAccountsLoading}
					sortKey={sortBy}
					sortOrder={sortOrder}
					onClick={row => {
						router.push(config.PATHS.dashboard.ADMIN.statement(row.id));
					}}
					onSortBy={(key, dir) => setParams({ page: null, sortBy: key || "", sortOrder: dir })}
				/>

				<Pagination
					currentCount={accountsData?.accounts.length || 0}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={accountsData?.totalCount || 0}
					setPerPage={pageSize => setParams({ page: null, pageSize })}
					showing
				/>
			</div>
		</>
	);
}
