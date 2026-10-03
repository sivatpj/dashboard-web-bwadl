"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useFetchInvoices } from "@/api/endpoints/back-office/invoices/fetch-invoices";
import { useFetchSalesOrders } from "@/api/endpoints/back-office/sales-orders/fetch-sales-orders";
import { IBuyer, IParticipantAccount, ISalesOrder } from "@/api/types";
import { UpdateSalesOrder } from "@/components/entities/admin/dashboard/invoices/update-salesorder";
import { CancelSalesOrderPopup } from "@/components/entities/admin/dashboard/sales-orders/cancel-sales-order-popup";
import { DeleteSalesOrderPopup } from "@/components/entities/admin/dashboard/sales-orders/delete-sales-order-popup";
import { ConfirmDeliveryPopup } from "@/components/entities/admin/dashboard/sales-orders/confirm-delivery-popup";
import { ViewSalesOrderPopup } from "@/components/entities/admin/dashboard/sales-orders/view-sales-order-popup";
import { PaymentTransactionPanel } from "@/components/entities/admin/dashboard/collections/payment-transaction-panel";
import { ParticipantDefaults } from "@/components/entities/admin/participant-defaults";
import { MyLimit } from "@/components/entities/buyer/dashboard/my-limit";
import { FormattedNumber } from "@/components/global/formatted-number";
import { HighlightText } from "@/components/global/highlight-text";
import { Icon } from "@/components/global/icon";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { UnderlineTabs } from "@/components/underline-tabs";
import { config, FEATURE_FLAGS } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { amountColorClass } from "@/lib/amount-color";
import dayjs from "dayjs";

type Tab = "limit" | "sales-orders" | "payment-history" | "more";

interface BuyerTabsProps {
	buyer: IBuyer & { participantBuyerReferences: IParticipantAccount[] };
}

export const BuyerTabs = ({ buyer }: BuyerTabsProps) => {
	const { t } = useTranslationContext();
	const router = useRouter();
	const searchParams = useSearchParams();
	const tabParam = searchParams.get("tab") as Tab | null;
	const [activeTab, setActiveTab] = useState<Tab>(tabParam ?? "limit");
	const [cancelSalesOrderId, setCancelSalesOrderId] = useState<number | null>(null);
	const [deleteSalesOrderId, setDeleteSalesOrderId] = useState<number | null>(null);
	const [editSalesOrder, setEditSalesOrder] = useState<ISalesOrder | null>(null);
	const [viewOnlySalesOrder, setViewOnlySalesOrder] = useState(false);
	const [viewSalesOrder, setViewSalesOrder] = useState<ISalesOrder | null>(null);
	const [confirmDeliverySalesOrder, setConfirmDeliverySalesOrder] = useState<ISalesOrder | null>(null);
	const setParams = useSetParams();

	const salesOrdersQ = searchParams.get("salesOrdersSearch") || "";
	const salesOrdersPage = Number(searchParams.get("salesOrdersPage") || "1");
	const pageSize = Number(
		searchParams.get("salesOrdersPageSize") ||
			localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) ||
			config.SALESORDERINBUYERTAB,
	);
	const salesOrdersSortBy = searchParams.get("salesOrdersSortBy") || "id";
	const salesOrdersSortOrder = (searchParams.get("salesOrdersSortOrder") || "desc") as "asc" | "desc";

	// All columns shown here are sortable server-side: real DB columns plus backend-computed aliases
	// the sales orders service can order by directly (calcDeliveryAmount, calcPaidAmount,
	// calcOutstanding, calcOverdue, invoicesCount).
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
	const isSalesOrdersClientSort = !!salesOrdersSortBy && !salesOrdersServerSortableKeys.has(salesOrdersSortBy);

	const setDebouncedSalesOrdersSearch = useDebouncedCallback(
		value => setParams({ salesOrdersPage: null, salesOrdersSearch: value || null }),
		1000,
	);

	const { data: topSalesOrdersData, isLoading: isLoadingTopSalesOrders } = useFetchSalesOrders({
		buyerId: buyer.id,
		limit: 8,
		page: 1,
		sortBy: "amount",
		sortOrder: "desc",
	});

	const { data: salesOrdersData, isLoading: isLoadingSalesOrders } = useFetchSalesOrders(
		isSalesOrdersClientSort
			? { buyerId: buyer.id, q: salesOrdersQ }
			: {
					buyerId: buyer.id,
					limit: pageSize,
					page: salesOrdersPage,
					q: salesOrdersQ,
					sortBy: salesOrdersSortBy,
					sortOrder: salesOrdersSortOrder,
				},
		{ enabled: activeTab === "sales-orders" },
	);

	const sortedSalesOrders = isSalesOrdersClientSort
		? [...(salesOrdersData?.salesOrders ?? [])].sort((a, b) => {
				// This table is already scoped to one buyer, so there's no buyer-name column/sort here.
				const getSortValue = (row: any) => Number(row[salesOrdersSortBy] ?? 0);
				const aVal = getSortValue(a);
				const bVal = getSortValue(b);
				if (typeof aVal === "string" || typeof bVal === "string") {
					return salesOrdersSortOrder === "asc"
						? String(aVal).localeCompare(String(bVal))
						: String(bVal).localeCompare(String(aVal));
				}
				return salesOrdersSortOrder === "asc" ? aVal - bVal : bVal - aVal;
			})
		: (salesOrdersData?.salesOrders ?? []);

	const pagedSalesOrders = isSalesOrdersClientSort
		? sortedSalesOrders.slice((salesOrdersPage - 1) * pageSize, (salesOrdersPage - 1) * pageSize + pageSize)
		: sortedSalesOrders;

	const { data: invoicesData } = useFetchInvoices(
		{ buyerId: buyer.id, limit: 10000 },
		{ enabled: activeTab === "sales-orders" || activeTab === "payment-history" },
	);

	const salesOrdersWithInvoices = new Set(
		(invoicesData?.invoices || []).map(inv => (inv as any).salesOrderId as number).filter(Boolean),
	);

	const invoiceCountBySalesOrder = (invoicesData?.invoices || []).reduce<Map<number, number>>((map, inv) => {
		const soId = (inv as any).salesOrderId as number;
		if (soId) map.set(soId, (map.get(soId) || 0) + 1);
		return map;
	}, new Map());

	const deliveryAmountBySalesOrder = (invoicesData?.invoices || []).reduce<Map<number, number>>((map, inv) => {
		const soId = (inv as any).salesOrderId as number;
		if (soId) map.set(soId, (map.get(soId) || 0) + (inv.deliveryAmount || 0));
		return map;
	}, new Map());



	const renderBoolean = (value: boolean | null | undefined) => {
		if (value == null) return "-";
		return value ? t("admin.sales-orders.yes") : t("admin.sales-orders.no");
	};

	const tabs: { value: Tab; label: string }[] = [
		{ label: t("admin.buyer.limit"), value: "limit" },
		{ label: t("admin.buyers.sales-orders"), value: "sales-orders" },
		{ label: t("admin.sales-orders.payment-history-tab"), value: "payment-history" },
		/* { label: t("admin.common.more"), value: "more" }, */
	];

	return (
		<div className="flex flex-col gap-4">
			<UnderlineTabs options={tabs} selected={activeTab} onChange={value => setActiveTab(value as Tab)} />

			{activeTab === "limit" && (
				<MyLimit
	availableLimit={buyer.calcAvailableLimit}
	calcOutstanding={buyer.calcOutstanding}
	className="rounded-md bg-[#EFF5F9] p-4"
	creditLimit={buyer.creditLimit}
	salesOrders={topSalesOrdersData?.salesOrders}
	overdue={buyer.calcOverdue}
	onDelivery={buyer.calcOnDelivery}
	loading={isLoadingTopSalesOrders}
/>	
			)}

			{activeTab === "sales-orders" && (
				<div className="flex flex-col gap-2">
					<div className="flex items-end gap-3">
						<div className="flex gap-2">
							<Input
								className="h-8 flex-1"
								defaultValue={salesOrdersQ}
								icon={<Icon className="h-4 w-4" name="Search" />}
								iconPosition="right"
								placeholder={t("admin.buyers.search-sales-order-placeholder")}
								type="text"
								onChange={e => setDebouncedSalesOrdersSearch(e.target.value)}
							/>
						</div>
					</div>

					<div className="flex overflow-hidden rounded-xl border border-gray-100">
						<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
						<DataTable
							className="flex-1"
							headers={[
{
									key: "id",
									label: t("admin.sales-orders.id"),
									sortable: true,
									render: value => <HighlightText query={salesOrdersQ} text={String(value ?? "")} />,
								},

								{
									key: "reference",
									label: t("admin.sales-orders.order-number"),
									sortable: true,
									render: value => <HighlightText query={salesOrdersQ} text={String(value ?? "")} />,
								},
								/* {
									key: "isCancelled",
									label: t("admin.sales-orders.cancelled"),
									render: renderBoolean,
								}, */
								{
									key: "isClosed",
									label: t("admin.sales-orders.closed"),
									sortable: true,
									render: renderBoolean,
								},
								{
									key: "orderDate",
									label: t("admin.sales-orders.order-date"),
									sortable: true,
									render: value => (value ? dayjs(value).format("DD MMM, YYYY") : "-"),
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
									render: value => <FormattedNumber className={amountColorClass(value ?? 0, "negative")} value={value ?? 0} />,
								},
								{
									alignment: "right",
									key: "calcOverdue",
									label: <RiyalTitle>{t("admin.sales-orders.overdue-amount")}</RiyalTitle>,
									sortable: true,
									render: value => <FormattedNumber className={amountColorClass(value ?? 0, "overdue")} value={value ?? 0} />,
								},
								{
									alignment: "right",
									key: "invoicesCount",
									label: t("admin.sales-orders.invoices-tab"),
									sortable: true,
									render: (value, row) => String(invoiceCountBySalesOrder.get(row.id) ?? value ?? 0),
								},
								{
									label: t("admin.suppliers.delivery-status"),
									alignment: "center",
									render: (_: unknown, row) => {
										const invoicesCount = invoiceCountBySalesOrder.get(row.id) ?? row.invoicesCount ?? 0;
										const hasDelivery =
											(row.calcDeliveryAmount ?? 0) > 0 || invoicesCount > 0 || salesOrdersWithInvoices.has(row.id);
										const status = row.deliveryStatus ?? (row.isCancelled ? "cancelled" : "not-delivered");

										if (status !== "cancelled" && !hasDelivery) {
											if (row.isClosed) {
												return <div className="flex justify-center">-</div>;
											}
											return (
												<button
													className="inline-flex items-center rounded-full bg-[#404040] px-3 py-1 text-xs font-medium text-white hover:bg-[#2f2f2f]"
													type="button"
													onClick={e => {
														e.stopPropagation();
														setConfirmDeliverySalesOrder(row);
													}}
												>
													{t("admin.sales-orders.confirm-delivery")}
												</button>
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
							data={pagedSalesOrders}
							sortKey={salesOrdersSortBy}
							sortOrder={salesOrdersSortOrder}
							onSortBy={(key, dir) =>
								setParams({ salesOrdersPage: null, salesOrdersSortBy: key || "", salesOrdersSortOrder: dir })
							}
							onClick={row =>
								router.push(
									`${config.PATHS.dashboard.ADMIN.salesOrder(row.id, row.buyerId)}?salesOrdersPage=${salesOrdersPage}`,
								)
							}
							onOpen={row =>
								router.push(
									`${config.PATHS.dashboard.ADMIN.salesOrder(row.id, row.buyerId)}?salesOrdersPage=${salesOrdersPage}`,
								)
							}
							renderEditAction={row => {
								if (row.isCancelled) return null;

								if (row.isClosed) {
									return (
										<div
											className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100"
											onClick={e => { e.stopPropagation(); setViewSalesOrder(row); }}
										>
											<Icon className="h-4 w-4" name="Eye" />
											{t("admin.common.view")}
										</div>
									);
								}

								return (
									<div
										className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100"
										onClick={e => { e.stopPropagation(); setViewOnlySalesOrder(false); setEditSalesOrder(row); }}
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
												onClick={e => { e.stopPropagation(); setCancelSalesOrderId(row.id); }}
											>
												<Icon className="h-4 w-4" name="DeletePopup" />
												{t("admin.common.cancel")}
											</div>
										)}
										{showDelete && (
											<div
												className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100"
												onClick={e => { e.stopPropagation(); setDeleteSalesOrderId(row.id); }}
											>
												<Icon className="h-4 w-4 fill-red-600" name="DeletePopup" />
												{t("admin.common.delete")}
											</div>
										)}
									</>
								);
							}}
							loading={isLoadingSalesOrders}
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
							salesOrder={editSalesOrder}
							invoicesCount={invoiceCountBySalesOrder.get(editSalesOrder.id) ?? (editSalesOrder as any).invoicesCount ?? 0}
							totalAmountInvoiced={deliveryAmountBySalesOrder.get(editSalesOrder.id) ?? 0}
							open
							viewOnly={viewOnlySalesOrder}
							onOpenChange={open => {
								if (!open) { setEditSalesOrder(null); setViewOnlySalesOrder(false); }
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

					{confirmDeliverySalesOrder && (
						<ConfirmDeliveryPopup
							salesOrder={confirmDeliverySalesOrder}
							open
							onOpenChange={open => {
								if (!open) setConfirmDeliverySalesOrder(null);
							}}
						/>
					)}

					<Pagination
						currentCount={pagedSalesOrders.length}
						page={salesOrdersPage}
						perPage={pageSize}
						setPage={page => setParams({ salesOrdersPage: page })}
						setPerPage={newPageSize => setParams({ salesOrdersPage: null, salesOrdersPageSize: newPageSize })}
						totalCount={salesOrdersData?.totalCount ?? 0}
						showing
					/>
				</div>
			)}

			{activeTab === "payment-history" && (
				<PaymentTransactionPanel buyerId={buyer.id} />
			)}

			{activeTab === "more" && <ParticipantDefaults id={buyer.id} type="buyer" />}
		</div>
	);
};
