"use client";

import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetchTransactions } from "@/api/endpoints/back-office/transactions/fetch-transactions";
import { TransactionsHeader } from "@/components/entities/admin/dashboard/transactions";
import { FormattedNumber } from "@/components/global/formatted-number";
import { HighlightText } from "@/components/global/highlight-text";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

export default function Page(props: PageProps<"/dashboard/transactions">) {
	const params = useSearchParams();
	const router = useRouter();
	const setParams = useSetParams();
	const { t } = useTranslationContext();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const q = params.get("search") || "";
	const exactRef = params.get("exactRef") || undefined;
	const sortBy = params.get("sortBy") || "createdAt";
	const sortOrder = (params.get("sortOrder") || "desc") as "asc" | "desc";

	const from = params.get("from") || undefined;
	const to = params.get("to") || undefined;
	const status = params.get("status") || undefined;
	const referenceNumber = params.get("referenceNumber") || undefined;

	const { data: transactionsData, isPending: isTransactionsLoading } = useFetchTransactions({
		exactRef,
		from,
		limit: pageSize,
		page,
		q,
		referenceNumber,
		sortBy,
		sortOrder,
		status,
		to,
	});

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.transactions.transactions"),
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<TransactionsHeader />

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={transactionsData?.journalEntries}
						headers={[
							// {
							// 	key: "referenceNumber",
							// 	label: t("admin.transactions.reference-number"),
							// 	sortable: true,
							// },
							// {
							// 	key: "status",
							// 	label: t("admin.transactions.status"),
							// 	sortable: true,
							// },
							{
								key: "date",
								label: t("admin.transactions.date"),
								render: value => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
								sortable: true,
								nowrap: true,
							},
							

							{
								key: "referenceNumber",
								label: t("admin.transactions.reference-number"),
								render: value => <HighlightText query={exactRef || q} text={String(value ?? "")} />,
							},

							{
								key: "description",
								label: t("admin.transactions.description"),
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							/* {
								key: "currencyCode",
								label: t("admin.transactions.currency"),
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							}, */
							{
								alignment: "right",
								key: "lines",
								label: <RiyalTitle>{t("admin.transactions.amount")}</RiyalTitle>,
								render: (lines: any[]) => {
									const totalDebit = lines?.reduce((sum, line) => sum + (line.debitAmount || 0), 0) || 0;
									return <FormattedNumber value={totalDebit} />;
								},
							},
							// {
							// 	alignment: "right",
							// 	key: "lines",
							// 	label: <RiyalTitle>{t("admin.transactions.credit-amount")}</RiyalTitle>,
							// 	render: (lines: any[]) => {
							// 		const totalCredit = lines?.reduce((sum, line) => sum + (line.creditAmount || 0), 0) || 0;
							// 		return <FormattedNumber value={totalCredit} />;
							// 	},
							// },
							{
								key: "createdAt",
								label: t("admin.transactions.created-at"),
								render: value => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"),
								sortable: true,
								nowrap: true,
							},
						]}
						loading={isTransactionsLoading}
						sortKey={sortBy}
						sortOrder={sortOrder}
						onClick={row => {
							router.push(config.PATHS.dashboard.ADMIN.transaction(row.id));
						}}
						onSortBy={(key, dir) => setParams({ page: null, sortBy: key || "", sortOrder: dir })}
					/>
				</div>

				<Pagination
					currentCount={transactionsData?.journalEntries.length || 0}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={transactionsData?.totalCount || 0}
					setPerPage={pageSize => setParams({ page: null, pageSize })}
					showing
				/>
			</div>
		</>
	);
}

