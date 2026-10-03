"use client";

import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { useFetchSalesOrder } from "@/api/endpoints/back-office/sales-orders/fetch-sales-order";
import { useFetchSalesOrderInvoices } from "@/api/endpoints/back-office/sales-orders/fetch-sales-order-invoices";
import { IInvoice } from "@/api/types";
import { CollectionStatusPill } from "@/components/entities/admin/dashboard/invoices/collection-status-pill";
import { EditInvoicePopup } from "@/components/entities/admin/dashboard/invoices/edit-invoice-popup";
import { DeleteInvoicePopUp } from "@/components/entities/admin/dashboard/invoices/invoice-delete-popup";
import { InvoiceCancelPopup } from "@/components/entities/admin/dashboard/invoices/invoice-cancel-popup";
import { InvoiceStatusPill } from "@/components/entities/admin/dashboard/invoices/invoice-status-pill";
import { SalesOrderDetails } from "@/components/entities/admin/dashboard/sales-orders/sales-order-details";
import { SalesOrderInformation } from "@/components/entities/admin/dashboard/sales-orders/sales-order-information";
import { DataLoading } from "@/components/global/data-loading";
import { Icon } from "@/components/global/icon";
import { FormattedNumber } from "@/components/global/formatted-number";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { UnderlineTabs } from "@/components/underline-tabs";
import { config, FEATURE_FLAGS } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { PaymentTransactionPanel } from "@/components/entities/admin/dashboard/collections/payment-transaction-panel";
import { SalesOrderActionPanel } from "@/components/entities/admin/dashboard/sales-orders/sales-order-action-panel";
import { useUpdateInvoice } from "@/api/endpoints/back-office/invoices/update-invoice.api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { amountColorClass } from "@/lib/amount-color";

const toAmount = (value: unknown) => {
	const amount = Number(value);
	return Number.isFinite(amount) ? amount : 0;
};

const getInvoiceStatusPriority = (status: IInvoice["status"]) => {
	if (status === "Confirm Delivery") return 0;
	if (status === "Partially Paid") return 1;
	if (status === "Ongoing") return 2;
	if (status === "Completed" || status === "Paid") return 3;
	if (status === "Cancelled") return 4;
	return 5;
};

export default function Page(props: PageProps<"/dashboard/buyers/[id]/sales-order/[salesOrderId]">) {
	const { id, salesOrderId } = use(props.params);
	const { t } = useTranslationContext();
	const router = useRouter();
	const searchParams = useSearchParams();
	const buyerId = Number(id);
	const fromSalesOrdersList = searchParams.get("fromSalesOrdersList");
	const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "invoices");
	const [deleteInvoiceId, setDeleteInvoiceId] = useState<number | null>(null);
	const [cancelInvoiceId, setCancelInvoiceId] = useState<number | null>(null);
	const [editInvoice, setEditInvoice] = useState<IInvoice | null>(null);
	const [viewOnlyInvoice, setViewOnlyInvoice] = useState(false);
	const [toggleFinalInvoiceId, setToggleFinalInvoiceId] = useState<number | null>(null);
	// This list is fetched in full for a single sales order (no server-side pagination), so sorting
	// is purely client-side against whatever's already loaded.
	const [invoicesSort, setInvoicesSort] = useState<{ key: string; order: "asc" | "desc" } | null>(null);

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

	const { data, isLoading } = useFetchSalesOrder({ id: salesOrderId }, { gcTime: 0, staleTime: 0 });

	const { data: invoicesData } = useFetchSalesOrderInvoices({ salesOrderId }, { gcTime: 0, staleTime: 0 });

	const invoices = (invoicesData?.invoices || [])
		.map(invoice => {
			const collections = invoice.collections || [];
			const collectionsPaidAmount = collections.reduce(
				(sum, collection) => sum + toAmount(collection.appliedAmount),
				0,
			);
			const invoiceAmount = toAmount(invoice.deliveryAmount || invoice.invoiceAmount || (invoice as any).amount);
			const calcCollection = Math.max(
				collectionsPaidAmount,
				toAmount(invoice.calcCollection),
				toAmount(invoice.calcPaid),
			);
			const paidAmount = toAmount((invoice as any).calcPaidAmount) || calcCollection;
			const outstandingAmount = Math.max(invoiceAmount - paidAmount, 0);
			const invoiceWithTotals = {
				...invoice,
				calcCollection,
				calcInstallments: collections.length || (invoice as any).calcInstallmentCount || invoice.calcInstallments || 0,
				invoiceAmount,
				invoiceReference: invoice.invoiceReference || "-",
				outstandingAmount,
			};

			return invoiceWithTotals;
		})
		.sort((a, b) => {
			const priorityDifference = getInvoiceStatusPriority(a.status) - getInvoiceStatusPriority(b.status);
			if (priorityDifference !== 0) return priorityDifference;

			return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
		});

	const sortedInvoices = invoicesSort
		? [...invoices].sort((a, b) => {
				const getSortValue = (row: any) => {
					if (invoicesSort.key === "calcPaidAmount") return Number(row.calcPaidAmount ?? 0);
					if (invoicesSort.key === "outstandingAmount") return Number(row.outstandingAmount ?? 0);
					if (invoicesSort.key === "calcOverdue") return Number(row.calcOverdue ?? 0);
					const value = row[invoicesSort.key];
					if (typeof value === "boolean") return value ? 1 : 0;
					if (typeof value === "number") return value;
					if (value == null) return "";
					return value;
				};
				const aVal = getSortValue(a);
				const bVal = getSortValue(b);
				if (typeof aVal === "string" || typeof bVal === "string") {
					return invoicesSort.order === "asc"
						? String(aVal).localeCompare(String(bVal))
						: String(bVal).localeCompare(String(aVal));
				}
				return invoicesSort.order === "asc" ? aVal - bVal : bVal - aVal;
			})
		: invoices;

	const invoiceLinkParams = (reference: string) =>
		`?salesOrderId=${salesOrderId}&salesOrderRef=${encodeURIComponent(reference || "")}${fromSalesOrdersList ? "&fromSalesOrdersList=1" : ""}`;

	const latestInvoiceId = invoices.reduce<number | null>(
		(maxId, inv) => (maxId === null || inv.id > maxId ? inv.id : maxId),
		null,
	);

	const latestInvoice = invoices.find(inv => inv.id === latestInvoiceId);
	// kept for potential future re-enable of final-invoice delete lock
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const isFinalInvoiceLocked = latestInvoice?.isFinal === true;

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						href: fromSalesOrdersList ? config.PATHS.dashboard.ADMIN.salesOrders : `/dashboard/buyers/${id}`,
						position: 0,
						title: fromSalesOrdersList ? t("admin.buyers.list-of-sales-orders") : data?.buyer?.facilityName,
					},
					{
						position: 1,
						title: null,
					},
					{
						position: 2,
						title: null,
					},
					{
						position: 3,
						title: data?.salesOrder?.reference || t("admin.sales-orders.sales-order-details"),
					},
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={data?.salesOrder}>
				{salesOrder => {
					const allInstallments = invoices.flatMap(inv =>
						(inv.collections || []).map(col => ({
							...col,
							invoiceReference: inv.invoiceReference,
						})),
					);


					return (
						<div className="flex h-full flex-col gap-4 px-4 py-4">
							<SalesOrderInformation
								{...salesOrder}
								deliveryStatus={data?.deliveryStatus ?? salesOrder.deliveryStatus}
								invoices={invoices}
								buyer={data?.buyer}
							/>

							<UnderlineTabs
								options={[
									{ label: t("admin.sales-orders.invoices-tab"), value: "invoices" },
									/* { label: t("admin.sales-orders.installments-tab"), value: "installments" }, */
									{ label: t("admin.sales-orders.payment-history-tab"), value: "payment-history" },
									{ label: t("admin.sales-orders.details-tab"), value: "details" },
									{ label: t("admin.common.sales-order-action"), value: "action" },
								]}
								selected={activeTab}
								onChange={setActiveTab}
							/>

							{activeTab === "invoices" && (
								<div className="flex overflow-hidden rounded-xl border border-gray-100">
									<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
									<DataTable
										className="flex-1"
										data={sortedInvoices}
										headers={[
											{
												key: "id",
												label: t("admin.invoices.id"),
												sortable: true,
											},

											{
												key: "invoiceReference",
												label: t("admin.invoices.invoice-reference"),
												sortable: true,
											},
											{
												key: "isFinal",
												label: t("admin.invoices.is-final"),
												sortable: true,
											},
											{
												key: "deliveryDate",
												label: t("admin.invoices.delivery-date"),
												sortable: true,
												render: value => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
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
												label: <RiyalTitle>{t("admin.invoices.paid-amount")}</RiyalTitle>,
												sortable: true,
												render: (_, row) => {
													const value = (row as any).calcPaidAmount ?? 0;
													return <FormattedNumber className={amountColorClass(value, "positive")} value={value} />;
												},
											},
											{
												alignment: "right",
												key: "outstandingAmount",
												label: <RiyalTitle>{t("admin.sales-orders.outstanding")}</RiyalTitle>,
												sortable: true,
												render: (_, row) => {
													const value = (row as any).outstandingAmount ?? 0;
													return <FormattedNumber className={amountColorClass(value, "negative")} value={value} />;
												},
											},

											{
												alignment: "right",
												key: "calcOverdue",
												label: <RiyalTitle>{t("admin.sales-orders.overdue-amount")}</RiyalTitle>,
												sortable: true,
												render: (_, row) => {
													const value = (row as any).calcOverdue ?? 0;
													return <FormattedNumber className={amountColorClass(value, "overdue")} value={value} />;
												},
											},
											{
												key: "calcInstallments",
												label: t("admin.invoices.installments"),
												sortable: true,
											},



											{
												key: "status",
												label: t("admin.invoices.invoice-status"),
												sortable: true,
												render: (_, invoice) => <InvoiceStatusPill status={invoice.status} />,
											},
										]}
										sortKey={invoicesSort?.key}
										sortOrder={invoicesSort?.order}
										onSortBy={(key, order) => setInvoicesSort(key ? { key, order } : null)}
										onClick={row =>
											router.push(
												`${config.PATHS.dashboard.ADMIN.invoice(row.id, buyerId)}${invoiceLinkParams(salesOrder.reference || "")}`,
											)
										}
										onOpen={row =>
											router.push(
												`${config.PATHS.dashboard.ADMIN.invoice(row.id, buyerId)}${invoiceLinkParams(salesOrder.reference || "")}`,
											)
										}
										renderEditAction={row => {
							if (FEATURE_FLAGS.SHOW_MARK_AS_FINAL_BUTTON_INVOICE !== 1) return null;
							if (row.id !== latestInvoiceId || row.isFinal) return null;

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

											const hasFinalInvoice = invoices.some(inv => inv.isFinal);
											const canDelete = showDelete && (!hasFinalInvoice || row.isFinal);

											return (
												<>
													{showCancel && (
														<div
															className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100"
															onClick={e => { e.stopPropagation(); setCancelInvoiceId(row.id); }}
														>
															<Icon className="h-4 w-4" name="DeletePopup" />
															{t("admin.common.cancel")}
														</div>
													)}
													{canDelete && (
														<div
															className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100"
															onClick={e => { e.stopPropagation(); setDeleteInvoiceId(row.id); }}
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
							)}

							{activeTab === "installments" && (
								<div className="flex overflow-hidden rounded-xl border border-gray-100">
									<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
									<DataTable
										className="flex-1"
										data={allInstallments}
										headers={[
											{
												key: "invoiceReference",
												label: t("admin.sales-orders.invoice-number"),
											},
											{
												key: "collectorCollectionReference",
												label: t("admin.sales-orders.installment-number"),
											},
											{
												alignment: "right",
												key: "amount",
												label: <RiyalTitle>{t("admin.sales-orders.installment-amount")}</RiyalTitle>,
												render: value => <FormattedNumber value={value} />,
											},
											{
												alignment: "right",
												key: "appliedAmount",
												label: <RiyalTitle>{t("admin.sales-orders.paid-amount")}</RiyalTitle>,
												render: value => <FormattedNumber className={amountColorClass(value, "positive")} value={value} />,
											},
											{
												key: "eligibleAt",
												label: t("admin.sales-orders.due-date"),
												render: value => (value ? dayjs(value).format("DD MMM, YYYY") : "-"),
											},
											{
												label: t("admin.sales-orders.installment-status"),
												render: (_, collection) => <CollectionStatusPill collection={collection} />,
											},
										]}
										onClick={row =>
											router.push(
												`${config.PATHS.dashboard.ADMIN.invoice(row.invoiceId, buyerId)}${invoiceLinkParams(salesOrder.reference || "")}`,
											)
										}
										onOpen={row =>
											router.push(
												`${config.PATHS.dashboard.ADMIN.invoice(row.invoiceId, buyerId)}${invoiceLinkParams(salesOrder.reference || "")}`,
											)
										}
									/>
								</div>
							)}

							{activeTab === "payment-history" && (
								<PaymentTransactionPanel buyerId={buyerId} salesOrderId={Number(salesOrderId)} />
							)}

							{activeTab === "action" && (
								<SalesOrderActionPanel
									salesOrderId={Number(salesOrderId)}
									buyerId={buyerId}
									salesOrderRef={data?.salesOrder?.reference}
								/>
							)}

							{activeTab === "details" && (
								<SalesOrderDetails
									{...salesOrder}
									deliveryStatus={data?.deliveryStatus ?? salesOrder.deliveryStatus}
									invoices={invoices}
									buyer={data?.buyer}
									collector={data?.collector}
									insurer={data?.insurer}
									financier={data?.financier}
									financierOffer={data?.financierOffer}
									supplier={data?.supplier}
								/>
							)}
						</div>
					);
				}}
			</DataLoading>

			<EditInvoicePopup
				invoice={editInvoice}
				open={!!editInvoice}
				viewOnly={viewOnlyInvoice}
				showFinalCheckbox={!!editInvoice && editInvoice.id === latestInvoiceId}
				onOpenChange={open => {
					if (!open) { setEditInvoice(null); setViewOnlyInvoice(false); }
				}}
			/>

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
		</>
	);
}
