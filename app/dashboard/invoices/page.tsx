"use client";

import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchInvoices } from "@/api/endpoints/back-office/invoices/fetch-invoices";
import { useUpdateInvoice } from "@/api/endpoints/back-office/invoices/update-invoice.api";
import { BuyersHeader } from "@/components/entities/admin/dashboard/buyers";
import { DeleteInvoicePopUp } from "@/components/entities/admin/dashboard/invoices/invoice-delete-popup";
import { InvoiceCancelPopup } from "@/components/entities/admin/dashboard/invoices/invoice-cancel-popup";
import { InvoiceStatusPill } from "@/components/entities/admin/dashboard/invoices/invoice-status-pill";
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
import { useToast } from "@/hooks/use-toast";
import { amountColorClass } from "@/lib/amount-color";

export default function Page() {
	const router = useRouter();

	const { t } = useTranslationContext();
	const [deleteInvoiceId, setDeleteInvoiceId] = useState<number | null>(null);
	const [cancelInvoiceId, setCancelInvoiceId] = useState<number | null>(null);
	const [toggleFinalInvoiceId, setToggleFinalInvoiceId] = useState<number | null>(null);

	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { mutate: updateInvoiceFinalStatus } = useUpdateInvoice(
		{ id: toggleFinalInvoiceId || 0 },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				setToggleFinalInvoiceId(null);
				queryClient.invalidateQueries({ queryKey: ["back-office"] });
			},
			onSuccess: () => {
				toast({
					description: t("admin.invoices.mark-as-final-success"),
					variant: "success",
				});
			},
		},
	);

	const params = useSearchParams();
	const setParams = useSetParams();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");
	const q = params.get("search") || "";
	const sortBy = params.get("sortBy") || "id";
	const sortOrder = (params.get("sortOrder") || "desc") as "asc" | "desc";

	const invoiceStatusFilter = params.get("status") || "";
	const collectorId = params.get("collectorId") ? Number(params.get("collectorId")) : undefined;
	const supplierId = params.get("supplierId") ? Number(params.get("supplierId")) : undefined;
	const financierId = params.get("financierId") ? Number(params.get("financierId")) : undefined;

	// All columns shown here are sortable server-side: real DB columns (id, reference, deliveryDate,
	// deliveryAmount) plus backend-computed aliases the invoices service can order by directly
	// (calcOutstanding, calcOverdue, calcPaidAmount, calcInstallmentCount). Buyer name is
	// intentionally not sortable (see the "buyer" header below): mixed Arabic/English facility names
	// don't sort sensibly under one collation. Invoice status isn't sortable either — there's already
	// a status filter for that.
	const invoicesServerSortableKeys = new Set([
		"id",
		"invoiceReference",
		"deliveryDate",
		"deliveryAmount",
		"calcPaidAmount",
		"outstandingAmount",
		"calcOverdue",
		"calcInstallments",
	]);
	const isInvoicesClientSort = !!sortBy && !invoicesServerSortableKeys.has(sortBy);
	// The row/header keys don't always match the backend column/alias name. "outstandingAmount" is
	// the header key (and what's displayed), but the backend's own "outstandingAmount" column uses a
	// different formula than what's shown — the displayed value is actually "calcOutstanding" (see
	// fetch-invoices.ts, which overrides outstandingAmount with calcOutstanding), so sort by that
	// instead to keep sort order consistent with what's on screen.
	const invoicesBackendSortByMap: Record<string, string> = {
		calcInstallments: "calcInstallmentCount",
		invoiceReference: "reference",
		outstandingAmount: "calcOutstanding",
	};
	const invoicesBackendSortBy = invoicesBackendSortByMap[sortBy] ?? sortBy;

	const { data: invoicesTabData, isFetching: isInvoicesTabLoading } = useFetchInvoices(
		isInvoicesClientSort
			? {
					collectorId,
					financierId,
					q,
					statuses: invoiceStatusFilter ? ([invoiceStatusFilter] as any) : undefined,
					supplierId,
				}
			: {
					collectorId,
					financierId,
					limit: pageSize,
					page,
					q,
					sortBy: invoicesBackendSortBy,
					sortOrder,
					statuses: invoiceStatusFilter ? ([invoiceStatusFilter] as any) : undefined,
					supplierId,
				},
	);

	const resolvedInvoicesTab = (invoicesTabData?.invoices ?? []).map(invoice => ({
		...invoice,
		calcInstallments:
			(invoice.collections || []).length ||
			(invoice as any).calcInstallmentCount ||
			invoice.calcInstallments ||
			0,
	}));

	const sortedInvoicesTab = isInvoicesClientSort
		? [...resolvedInvoicesTab].sort((a, b) => {
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
		: resolvedInvoicesTab;

	const pagedInvoicesTab = isInvoicesClientSort
		? sortedInvoicesTab.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
		: sortedInvoicesTab;

	// Mirrors the per-sales-order page: only the highest-id invoice within a sales order can be
	// marked final. Computed from the invoices currently loaded in this tab (rows from other sales
	// orders don't affect each other).
	const latestInvoiceIdBySalesOrder = resolvedInvoicesTab.reduce<Map<number, number>>((map, inv) => {
		const soId = (inv as any).salesOrderId as number;
		if (soId && (!map.has(soId) || inv.id > (map.get(soId) as number))) map.set(soId, inv.id);
		return map;
	}, new Map());

	return (
		<>
			<BreadcrumbTitles crumbs={[{ position: 0, title: t("admin.buyers.list-of-invoices") }]} />

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<BuyersHeader filters={invoicesTabData?.filters} />

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={pagedInvoicesTab}
						headers={[
							{
								key: "id",
								label: "ID",
								sortable: true,
							},
							{
								key: "invoiceReference",
								label: t("admin.invoices.invoice-reference"),
								sortable: true,
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							{
								key: "buyer",
								label: t("admin.sales-orders.buyer-name"),
								render: (value, row) => {
									const buyer = (value ?? (row as any).buyer) as { facilityName?: string; buyerName?: string } | undefined;
									const name = buyer?.facilityName || buyer?.buyerName || "-";
									return <HighlightText query={q} text={String(name)} />;
								},
							},
							{
								key: "deliveryDate",
								label: t("admin.invoices.delivery-date"),
								sortable: true,
								render: value => (value ? dayjs(value as string).format("DD MMM, YYYY") : "-"),
							},
							{
								alignment: "right",
								key: "deliveryAmount",
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
								key: "outstandingAmount",
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
								key: "calcInstallments",
								label: t("admin.invoices.installments"),
								sortable: true,
							},
							{
								alignment: "center",
								key: "status",
								label: t("admin.invoices.invoice-status"),
								render: (_, row) => <InvoiceStatusPill status={row.status} />,
							},
						]}
						loading={isInvoicesTabLoading}
						sortKey={sortBy}
						sortOrder={sortOrder}
						onSortBy={(key, dir) => setParams({ page: null, sortBy: key || "", sortOrder: dir })}
						onClick={row =>
							router.push(
								`${config.PATHS.dashboard.ADMIN.invoice(row.id, row.buyerId ?? (row as any).buyer?.id)}?fromInvoiceList=1&status=${invoiceStatusFilter}`,
							)
						}
						onOpen={row =>
							router.push(
								`${config.PATHS.dashboard.ADMIN.invoice(row.id, row.buyerId ?? (row as any).buyer?.id)}?fromInvoiceList=1&status=${invoiceStatusFilter}`,
							)
						}
						renderEditAction={row => {
							if (FEATURE_FLAGS.SHOW_MARK_AS_FINAL_BUTTON_INVOICE !== 1) return null;
							const soId = (row as any).salesOrderId as number;
							if (row.id !== latestInvoiceIdBySalesOrder.get(soId) || row.isFinal) return null;

							return (
								<div
									className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100"
									onClick={e => {
										e.stopPropagation();
										setToggleFinalInvoiceId(row.id);
										updateInvoiceFinalStatus({ isFinal: true });
									}}
								>
									<Icon className="h-4 w-4" name="Tick" />
									{t("admin.invoices.mark-as-final")}
								</div>
							);
						}}
						renderDeleteAction={row => {
							const showCancel = FEATURE_FLAGS.SHOW_CANCEL_BUTTON_INVOICE === 1;
							const showDelete = FEATURE_FLAGS.SHOW_DELETE_BUTTON_INVOICE === 1;
							if (!showCancel && !showDelete) return null;

							return (
								<>
									{showCancel && (
										<div
											className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100"
											onClick={e => {
												e.stopPropagation();
												setCancelInvoiceId(row.id);
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
												setDeleteInvoiceId(row.id);
											}}
										>
											<Icon className="h-4 w-4 fill-red-600" name="DeletePopup" />
											{t("admin.common.delete")}
										</div>
									)}
								</>
							);
						}}
					/>
				</div>

				{deleteInvoiceId && (
					<DeleteInvoicePopUp
						invoiceId={deleteInvoiceId}
						open
						onOpenChange={open => {
							if (!open) setDeleteInvoiceId(null);
						}}
					/>
				)}

				{cancelInvoiceId && (
					<InvoiceCancelPopup
						invoiceId={cancelInvoiceId}
						open
						onOpenChange={open => {
							if (!open) setCancelInvoiceId(null);
						}}
					/>
				)}

				<Pagination
					currentCount={pagedInvoicesTab.length}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={invoicesTabData?.totalCount}
					showing
					setPerPage={pageSize => setParams({ page: null, pageSize })}
				/>
			</div>
		</>
	);
}
