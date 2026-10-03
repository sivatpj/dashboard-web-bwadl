"use client";

import dayjs from "dayjs";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useFetchOverdueSalesOrdersReport } from "@/api/endpoints/back-office/reports/fetch-overdue-sales-orders-report";
import { ReportPreviewDialog } from "@/components/entities/admin/reports/report-preview-dialog";
import { CombinedFiltersRow } from "@/components/global/combined-filters-row";
import { FormattedNumber } from "@/components/global/formatted-number";
import { Pagination } from "@/components/global/pagination";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DateInput } from "@/components/ui/date-input";
import { RiyalTitle } from "@/components/global/riyal-title";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { config } from "@/constants/config";
import { amountColorClass } from "@/lib/amount-color";

export default function Page() {
	const { t } = useTranslationContext();
	const params = useSearchParams();
	const setParams = useSetParams();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const today = dayjs().format("YYYY-MM-DD");
	const overdueAsOfDateParam = params.get("overdueAsOfDate") || today;
	const collectorIdParam = params.get("collectorId") ? Number(params.get("collectorId")) : undefined;
	const supplierIdParam = params.get("supplierId") ? Number(params.get("supplierId")) : undefined;
	const buyerIdParam = params.get("buyerId") ? Number(params.get("buyerId")) : undefined;
	const financierIdParam = params.get("financierId") ? Number(params.get("financierId")) : undefined;
	const minDelayedDaysParam = params.get("minDelayedDays") ? Number(params.get("minDelayedDays")) : undefined;
	const sortBy = params.get("sortBy") || undefined;
	const sortOrder = (params.get("sortOrder") || "asc") as "asc" | "desc";

	const [overdueAsOfDateInput, setOverdueAsOfDateInput] = useState(overdueAsOfDateParam);
	const [sendDialogOpen, setSendDialogOpen] = useState(false);

	const debouncedSetOverdueAsOfDate = useDebouncedCallback(
		(value: string) => setParams({ page: null, overdueAsOfDate: value || null }),
		500,
	);

	const { data, isFetching: isPending } = useFetchOverdueSalesOrdersReport({
		overdueAsOfDate: overdueAsOfDateParam,
		collectorId: collectorIdParam,
		supplierId: supplierIdParam,
		buyerId: buyerIdParam,
		financierId: financierIdParam,
		minDelayedDays: minDelayedDaysParam,
		sortBy,
		sortOrder,
		page,
		pageSize,
	});

	// The sorted / filtered state (delayed-days threshold + column sort) is carried into the sent report
	const { data: allData } = useFetchOverdueSalesOrdersReport(
		{
			overdueAsOfDate: overdueAsOfDateParam,
			collectorId: collectorIdParam,
			supplierId: supplierIdParam,
			buyerId: buyerIdParam,
			financierId: financierIdParam,
			minDelayedDays: minDelayedDaysParam,
			sortBy,
			sortOrder,
		},
		{ enabled: sendDialogOpen },
	);

	const pagedRows = data?.rows ?? [];
	const totalCount = data?.totalCount ?? 0;
	const allRows = allData?.rows ?? [];

	return (
		<>
			<BreadcrumbTitles crumbs={[{ position: 0, title: t("admin.reports.overdue-sales-orders") }]} />

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<div className="flex flex-wrap items-end gap-x-6 gap-y-4 rounded-xl border border-gray-100 p-4">
					<div className="w-64 shrink-0">
						<DateInput
							label={t("admin.reports.overdue-as-of-date")}
							value={overdueAsOfDateInput}
							onChange={date => {
								const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
								setOverdueAsOfDateInput(formatted);
								debouncedSetOverdueAsOfDate(formatted);
							}}
							disableFutureDates
						/>
					</div>
					<CombinedFiltersRow
						fieldClassName="flex w-44 shrink-0 flex-col gap-1"
						fields={[
							{
								key: "collectorId",
								label: t("admin.reports.collector"),
								options: (data?.filters?.collectors ?? []).map(c => ({ id: c.id, name: c.name ?? "" })),
								placeholder: t("admin.reports.collector-placeholder"),
								selectedId: collectorIdParam,
							},
							{
								key: "supplierId",
								label: t("admin.reports.supplier"),
								options: (data?.filters?.suppliers ?? []).map(s => ({ id: s.id, name: s.name ?? "" })),
								placeholder: t("admin.reports.supplier-placeholder"),
								selectedId: supplierIdParam,
							},
							{
								key: "buyerId",
								label: t("admin.reports.buyer"),
								options: (data?.filters?.buyers ?? []).map(b => ({ id: b.id, name: b.name ?? "" })),
								placeholder: t("admin.reports.buyer-placeholder"),
								selectedId: buyerIdParam,
							},
							{
								key: "financierId",
								label: t("admin.reports.financier"),
								options: (data?.filters?.financiers ?? []).map(f => ({ id: f.id, name: f.name ?? "" })),
								placeholder: t("admin.reports.financier-placeholder"),
								selectedId: financierIdParam,
							},
						]}
						numberField={{
							key: "minDelayedDays",
							label: t("admin.reports.delayed-days-filter"),
							placeholder: t("admin.reports.delayed-days-filter-placeholder"),
							selectedValue: minDelayedDaysParam !== undefined ? String(minDelayedDaysParam) : undefined,
							min: 0,
						}}
					/>

					{!!totalCount && (
						<Button className="shrink-0" variant="outline" onClick={() => setSendDialogOpen(true)}>
							{t("admin.reports.send-report")}
						</Button>
					)}
				</div>

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={pagedRows}
						loading={isPending}
						sortKey={sortBy}
						sortOrder={sortOrder}
						onSortBy={(key, dir) => setParams({ page: null, sortBy: key || null, sortOrder: dir })}
						headers={[
							{ key: "reference", label: t("admin.reports.reference") },
							{
								key: "orderDate",
								label: t("admin.reports.order-date"),
								sortable: true,
								render: value => (value ? dayjs(value as string).format("DD MMM, YYYY") : "-"),
							},
							{
								alignment: "right",
								key: "orderAmount",
								label: <RiyalTitle>{t("admin.reports.order-amount")}</RiyalTitle>,
								sortable: true,
								render: value => <FormattedNumber value={value} />,
							},
							{ key: "deliveryReference", label: t("admin.reports.delivery-reference") },
							{
								key: "deliveryDate",
								label: t("admin.reports.delivery-date"),
								sortable: true,
								render: value => (value ? dayjs(value as string).format("DD MMM, YYYY") : "-"),
							},
							{
								alignment: "right",
								key: "deliveryAmount",
								label: <RiyalTitle>{t("admin.reports.delivery-amount")}</RiyalTitle>,
								sortable: true,
								render: value => <FormattedNumber value={value} />,
							},
							{
								alignment: "right",
								key: "overdueAmount",
								label: <RiyalTitle>{t("admin.reports.overdue-amount")}</RiyalTitle>,
								sortable: true,
								render: value => <FormattedNumber className={amountColorClass(value, "overdue")} value={value} />,
							},
							{
								alignment: "right",
								key: "delayedDays",
								label: t("admin.reports.delayed-days"),
								sortable: true,
								render: value => (value === null || value === undefined ? "-" : Math.round(value)),
							},
							{ key: "buyerFacilityName", label: t("admin.reports.buyer-facility") },
						]}
					/>
				</div>

				<Pagination
					currentCount={pagedRows.length}
					page={page}
					perPage={pageSize}
					setPage={p => setParams({ page: p })}
					totalCount={totalCount}
					setPerPage={size => setParams({ page: null, pageSize: size })}
					showing
				/>
			</div>

			<ReportPreviewDialog
				open={sendDialogOpen}
				onOpenChange={setSendDialogOpen}
				rows={allRows}
				overdueAsOfDate={overdueAsOfDateParam}
				collectorId={collectorIdParam}
				collectorFacilityName={data?.filters?.collectors?.find(c => c.id === collectorIdParam)?.name ?? undefined}
				supplierId={supplierIdParam}
				supplierFacilityName={data?.filters?.suppliers?.find(s => s.id === supplierIdParam)?.name ?? undefined}
				buyerId={buyerIdParam}
				buyerFacilityName={data?.filters?.buyers?.find(b => b.id === buyerIdParam)?.name ?? undefined}
			/>
		</>
	);
}