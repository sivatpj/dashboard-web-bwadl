"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFetchBuyers } from "@/api/endpoints/back-office/buyers/fetch-buyers";
import { BuyersHeader } from "@/components/entities/admin/dashboard/buyers";
import { DeleteBuyerPopUp } from "@/components/entities/admin/dashboard/buyers/delete-buyer-pop-up";
import { FormattedNumber } from "@/components/global/formatted-number";
import { HighlightText } from "@/components/global/highlight-text";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { amountColorClass } from "@/lib/amount-color";

export default function Page(props: PageProps<"/dashboard/buyers">) {
	const router = useRouter();

	const { t } = useTranslationContext();
	const [deleteBuyer, setDeleteBuyer] = useState<{ id: number; hasActiveInvoices: boolean } | null>(null);

	const params = useSearchParams();
	const setParams = useSetParams();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");
	const q = params.get("search") || "";
	const sortBy = params.get("sortBy") || "id";
	const sortOrder = (params.get("sortOrder") || "desc") as "asc" | "desc";

	// "calcOutstanding" and "calcOverdue" are derived values (not real DB columns), so the
	// backend can't order by them. Fetch every buyer and sort/paginate these two locally instead.
	const isClientSideSort = sortBy === "calcOutstanding" || sortBy === "calcOverdue";

	const { data: buyersData, isPending: isBuyersLoading } = useFetchBuyers(
		isClientSideSort
			? { q }
			: {
					limit: pageSize,
					page,
					q,
					sortBy,
					sortOrder,
				},
	);

	const sortedBuyers = isClientSideSort
		? [...(buyersData?.buyers ?? [])].sort((a, b) => {
				const aVal = Number((a as any)[sortBy] ?? 0);
				const bVal = Number((b as any)[sortBy] ?? 0);
				return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
			})
		: (buyersData?.buyers ?? []);

	const pagedBuyers = isClientSideSort
		? sortedBuyers.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
		: sortedBuyers;

	return (
		<>
			<BreadcrumbTitles crumbs={[{ position: 0, title: t("admin.buyers.list-of-buyers") }]} />

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<BuyersHeader />

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={pagedBuyers}
						headers={[
							{
								key: "id",
								label: t("admin.buyers.buyer-id"),
								sortable: true,
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							{
								key: "crNumber",
								label: t("admin.buyers.cr-number"),
								sortable: true,
								render: value =>
									value ? <HighlightText query={q} text={String(value)} /> : "-",
							},
							{
								key: "buyerName",
								label: t("admin.buyers.brand-name"),
								sortable: true,
								warningLogic: row => !row.buyerName || row.buyerName === "",
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							{
								key: "facilityName",
								label: t("admin.buyers.facility-name"),
								sortable: true,
								warningLogic: row => !row.facilityName || row.facilityName === "",
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							{
								alignment: "right",
								key: "creditLimit",
								label: <RiyalTitle>{t("admin.buyers.credit-limit")}</RiyalTitle>,
								render: value => <FormattedNumber value={value} />,
								sortable: true,
							},
							{
								alignment: "right",
								key: "calcAvailableLimit",
								label: <RiyalTitle>{t("admin.buyers.available-limit")}</RiyalTitle>,
								render: (_, row) => (
									<FormattedNumber
										value={
											typeof row.calcAvailableLimit === "number"
												? row.calcAvailableLimit
												: (row.creditLimit || 0) - (row.calcOutstanding || 0)
										}
									/>
								),
								sortable: true,
							},
							{
								alignment: "right",
								key: "calcOutstanding",
								label: <RiyalTitle>{t("admin.buyers.outstanding")}</RiyalTitle>,
								render: value => <FormattedNumber className={amountColorClass(value, "negative")} value={value} />,
								sortable: true,
							},
							{
								alignment: "right",
								key: "calcOverdue",
								label: <RiyalTitle>{t("admin.buyers.overdue")}</RiyalTitle>,
								render: value => <FormattedNumber className={amountColorClass(value, "overdue")} value={value} />,
								sortable: true,
							},
						]}
						loading={isBuyersLoading}
						sortKey={sortBy}
						sortOrder={sortOrder}
						onClick={row => router.push(config.PATHS.dashboard.ADMIN.buyer(row.id))}
						onOpen={row => router.push(config.PATHS.dashboard.ADMIN.buyer(row.id))}
						onEdit={row => router.push(config.PATHS.dashboard.ADMIN.editBuyer(row.id))}
						onDelete={row => setDeleteBuyer({ hasActiveInvoices: Boolean(row.calcOutstanding), id: row.id })}
						onSortBy={(key, dir) => setParams({ page: null, sortBy: key || "", sortOrder: dir })}
					/>
				</div>

				{deleteBuyer && (
					<DeleteBuyerPopUp
						buyerId={deleteBuyer.id}
						hasActiveInvoices={deleteBuyer.hasActiveInvoices}
						open
						onOpenChange={open => {
							if (!open) setDeleteBuyer(null);
						}}
					/>
				)}

				<Pagination
					currentCount={pagedBuyers.length}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={buyersData?.totalCount}
					showing
					setPerPage={pageSize => setParams({ page: null, pageSize })}
				/>
			</div>
		</>
	);
}
