"use client";

import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFetchSalesOrders } from "@/api/endpoints/back-office/sales-orders/fetch-sales-orders";
import { ISalesOrder } from "@/api/types";
import { BuyersHeader } from "@/components/entities/admin/dashboard/buyers";
import { UpdateSalesOrder } from "@/components/entities/admin/dashboard/invoices/update-salesorder";
import { ViewSalesOrderPopup } from "@/components/entities/admin/dashboard/sales-orders/view-sales-order-popup";
import { CancelSalesOrderPopup } from "@/components/entities/admin/dashboard/sales-orders/cancel-sales-order-popup";
import { DeleteSalesOrderPopup } from "@/components/entities/admin/dashboard/sales-orders/delete-sales-order-popup";
import { FormattedNumber } from "@/components/global/formatted-number";
import { HighlightText } from "@/components/global/highlight-text";
import { Icon } from "@/components/global/icon";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { config, FEATURE_FLAGS } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { amountColorClass } from "@/lib/amount-color";

export default function Page() {
	const router = useRouter();

	const { t } = useTranslationContext();
	const [cancelSalesOrderId, setCancelSalesOrderId] = useState<number | null>(null);
	const [deleteSalesOrderId, setDeleteSalesOrderId] = useState<number | null>(null);
	const [editSalesOrder, setEditSalesOrder] = useState<ISalesOrder | null>(null);
	const [viewSalesOrder, setViewSalesOrder] = useState<ISalesOrder | null>(null);

	const params = useSearchParams();
	const setParams = useSetParams();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");
	const q = params.get("search") || "";
	const sortBy = params.get("sortBy") || "id";
	const sortOrder = (params.get("sortOrder") || "desc") as "asc" | "desc";

	// All columns shown here are sortable server-side: real DB columns (id, reference, orderDate,
	// amount, isClosed) plus backend-computed aliases the sales orders service can order by directly
	// (calcDeliveryAmount, calcPaidAmount, calcOutstanding, calcOverdue, invoicesCount). Buyer name is
	// intentionally not sortable (see the "buyer" header below): mixed Arabic/English facility names
	// don't sort sensibly under one collation.
	const salesOrdersServerSortableKeys = new Set([
		"id",
		"reference",
		"orderDate",
		"amount",
		"isClosed",
		"calcDeliveryAmount",
		"calcPaidAmount",
		"calcOutstanding",
		"calcOverdue",
		"invoicesCount",
	]);
	const isSalesOrdersClientSort = !!sortBy && !salesOrdersServerSortableKeys.has(sortBy);

	const salesOrderDeliveryStatusFilter = (params.get("deliveryStatus") || "") as
		| "cancelled"
		| "not-delivered"
		| "over-delivered"
		| "delivered"
		| "partially-delivered"
		| "";
	const collectorId = params.get("collectorId") ? Number(params.get("collectorId")) : undefined;
	const supplierId = params.get("supplierId") ? Number(params.get("supplierId")) : undefined;
	const financierId = params.get("financierId") ? Number(params.get("financierId")) : undefined;

	const { data: salesOrdersData, isFetching: isSalesOrdersLoading } = useFetchSalesOrders(
		isSalesOrdersClientSort
			? { collectorId, deliveryStatus: salesOrderDeliveryStatusFilter || undefined, financierId, q, supplierId }
			: {
					collectorId,
					deliveryStatus: salesOrderDeliveryStatusFilter || undefined,
					financierId,
					limit: pageSize,
					page,
					q,
					sortBy,
					sortOrder,
					supplierId,
				},
	);

	const sortedSalesOrders = isSalesOrdersClientSort
		? [...(salesOrdersData?.salesOrders ?? [])].sort((a, b) => {
				// Buyer name is intentionally not sortable (see the "buyer" header below): mixed
				// Arabic/English facility names don't sort sensibly under one collation.
				const getSortValue = (row: any) => Number(row[sortBy] ?? 0);
				const aVal = getSortValue(a);
				const bVal = getSortValue(b);
				if (typeof aVal === "string" || typeof bVal === "string") {
					return sortOrder === "asc"
						? String(aVal).localeCompare(String(bVal))
						: String(bVal).localeCompare(String(aVal));
				}
				return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
			})
		: (salesOrdersData?.salesOrders ?? []);

	const pagedSalesOrders = isSalesOrdersClientSort
		? sortedSalesOrders.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
		: sortedSalesOrders;

	const renderBoolean = (value: boolean | null | undefined) => {
		if (value == null) return "-";
		return value ? t("admin.sales-orders.yes") : t("admin.sales-orders.no");
	};

	return (
		<>
			<BreadcrumbTitles crumbs={[{ position: 0, title: t("admin.buyers.list-of-sales-orders") }]} />

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<BuyersHeader filters={salesOrdersData?.filters} />

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={pagedSalesOrders}
						headers={[
							{
								key: "id",
								label: "ID",
								sortable: true,
							},
							{
								key: "reference",
								label: t("admin.sales-orders.order-number"),
								sortable: true,
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							{
								key: "buyer",
								label: t("admin.sales-orders.buyer-name"),
								render: value => (value as { facilityName?: string } | undefined)?.facilityName ?? "-",
							},
							{
								key: "isClosed",
								label: "Closed",
								sortable: true,
								render: renderBoolean,
							},
							{
								key: "orderDate",
								label: t("admin.sales-orders.order-date"),
								sortable: true,
								render: value => (value ? dayjs(value as string).format("DD MMM, YYYY") : "-"),
							},
							{
								alignment: "right",
								key: "amount",
								label: <RiyalTitle>{t("admin.sales-orders.order-amount")}</RiyalTitle>,
								sortable: true,
								render: value => <FormattedNumber value={value} />,
							},
							{
								alignment: "right",
								key: "calcDeliveryAmount",
								label: <RiyalTitle>{t("admin.sales-orders.delivery-amount")}</RiyalTitle>,
								sortable: true,
								render: value => <FormattedNumber value={value ?? 0} />,
							},
							{
								alignment: "right",
								key: "calcPaidAmount",
								label: <RiyalTitle>{t("admin.sales-orders.paid-amount")}</RiyalTitle>,
								sortable: true,
								render: value => <FormattedNumber className={amountColorClass(value ?? 0, "positive")} value={value ?? 0} />,
							},
							{
								alignment: "right",
								key: "calcOutstanding",
								label: <RiyalTitle>{t("admin.sales-orders.outstanding")}</RiyalTitle>,
								sortable: true,
								render: value => (
									<FormattedNumber className={amountColorClass(value ?? 0, "negative")} value={value ?? 0} />
								),
							},
							{
								alignment: "right",
								key: "calcOverdue",
								label: <RiyalTitle>{t("admin.sales-orders.overdue-amount")}</RiyalTitle>,
								sortable: true,
								render: value => (
									<FormattedNumber className={amountColorClass(value ?? 0, "overdue")} value={value ?? 0} />
								),
							},
							{
								key: "invoicesCount",
								label: t("admin.sales-orders.invoices-tab"),
								sortable: true,
								render: value => String(value ?? 0),
							},

							{
								label: t("admin.suppliers.delivery-status"),
								alignment: "center",
								render: (_: unknown, row) => {
									const invoiceCount = row.invoicesCount ?? 0;
									const status = row.deliveryStatus ?? (row.isCancelled ? "cancelled" : "not-delivered");

									if (status !== "cancelled" && invoiceCount === 0) {
										if (row.isClosed) {
											return <div className="flex justify-center">-</div>;
										}
										return (
											<span className="inline-flex items-center rounded-full bg-[#404040] px-3 py-1 text-xs font-medium text-white">
												{t("admin.sales-orders.confirm-delivery")}
											</span>
										);
									}

									const colorByStatus: Record<string, string> = {
										cancelled: "#D32F2F",
										"over-delivered": "#38A06C",
										delivered: "#38A06C",
										"partially-delivered": "#C97A1F",
										"not-delivered": "#D32F2F",
									};
									const label =
										status === "cancelled"
											? t("admin.sales-orders.status-cancelled")
											: t(`admin.sales-orders.${status}`);
									const color = colorByStatus[status] ?? "#D32F2F";

									return (
										<div
											className="inline-flex items-center gap-2 rounded-lg px-2 py-1"
											style={{
												backgroundColor: color === "#38A06C" ? "#E1FCEF" : "#FCF2E6",
												color,
											}}
										>
											<div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
											<span className="font-light">{label}</span>
										</div>
									);
								},
							},
						]}
						loading={isSalesOrdersLoading}
						sortKey={sortBy}
						sortOrder={sortOrder}
						onClick={row =>
							router.push(`${config.PATHS.dashboard.ADMIN.salesOrder(row.id, row.buyerId)}?fromSalesOrdersList=1`)
						}
						onOpen={row =>
							router.push(`${config.PATHS.dashboard.ADMIN.salesOrder(row.id, row.buyerId)}?fromSalesOrdersList=1`)
						}
						renderEditAction={row => {
							if (row.isCancelled) return null;

							if (row.isClosed) {
								return (
									<div
										className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100"
										onClick={e => {
											e.stopPropagation();
											setViewSalesOrder(row);
										}}
									>
										<Icon className="h-4 w-4" name="Eye" />
										{t("admin.common.view")}
									</div>
								);
							}

							return (
								<div
									className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100"
									onClick={e => {
										e.stopPropagation();
										setEditSalesOrder(row);
									}}
								>
									<Icon className="h-4 w-4" name="Edit" />
									{t("admin.common.edit")}
								</div>
							);
						}}
						renderDeleteAction={row => {
							if (row.isCancelled || row.isClosed) return null;
							const showCancel = FEATURE_FLAGS.SHOW_CANCEL_BUTTON_SALES_ORDER === 1;
							const showDelete = FEATURE_FLAGS.SHOW_DELETE_BUTTON_SALES_ORDER === 1;
							if (!showCancel && !showDelete) return null;
							return (
								<>
									{showCancel && (
										<div
											className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100"
											onClick={e => {
												e.stopPropagation();
												setCancelSalesOrderId(row.id);
											}}
										>
											<Icon className="h-4 w-4" name="DeletePopup" />
											{t("admin.common.cancel")}
										</div>
									)}
									{showDelete && (
										<div
											className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100"
											onClick={e => {
												e.stopPropagation();
												setDeleteSalesOrderId(row.id);
											}}
										>
											<Icon className="h-4 w-4 fill-red-600" name="DeletePopup" />
											{t("admin.common.delete")}
										</div>
									)}
								</>
							);
						}}
						onSortBy={(key, dir) => setParams({ page: null, sortBy: key || "", sortOrder: dir })}
					/>
				</div>

				{cancelSalesOrderId && (
					<CancelSalesOrderPopup
						salesOrderId={cancelSalesOrderId}
						open
						onOpenChange={open => {
							if (!open) setCancelSalesOrderId(null);
						}}
					/>
				)}

				{deleteSalesOrderId && (
					<DeleteSalesOrderPopup
						salesOrderId={deleteSalesOrderId}
						open
						onOpenChange={open => {
							if (!open) setDeleteSalesOrderId(null);
						}}
					/>
				)}

				{editSalesOrder && (
					<UpdateSalesOrder
						invoicesCount={(editSalesOrder as any).invoicesCount ?? 0}
						salesOrder={editSalesOrder}
						totalAmountInvoiced={(editSalesOrder as any).calcDeliveryAmount ?? 0}
						open
						onOpenChange={open => {
							if (!open) setEditSalesOrder(null);
						}}
					/>
				)}

				{viewSalesOrder && (
					<ViewSalesOrderPopup
						salesOrder={viewSalesOrder}
						open
						onOpenChange={open => {
							if (!open) setViewSalesOrder(null);
						}}
					/>
				)}

				<Pagination
					currentCount={pagedSalesOrders.length}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={salesOrdersData?.totalCount}
					showing
					setPerPage={pageSize => setParams({ page: null, pageSize })}
				/>
			</div>
		</>
	);
}
