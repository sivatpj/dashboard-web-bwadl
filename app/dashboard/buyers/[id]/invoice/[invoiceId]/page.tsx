"use client";

import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { useFetchInvoice } from "@/api/endpoints/back-office/invoices/fetch-invoice";
import { ICollection } from "@/api/types";
//import { CollectionPopUp } from "@/components/entities/admin/dashboard/invoices/collection-popup";
import { CollectionStatusPill } from "@/components/entities/admin/dashboard/invoices/collection-status-pill";
import { ConfirmInvoiceDelivery } from "@/components/entities/admin/dashboard/invoices/confirm-invoice-delivery";
import { DeleteInvoicePopUp } from "@/components/entities/admin/dashboard/invoices/invoice-delete-popup";
import { InvoiceDetailsForm } from "@/components/entities/admin/dashboard/invoices/invoice-details-form";
import { InvoiceInformation } from "@/components/entities/admin/dashboard/invoices/invoice-information";
import { DataLoading } from "@/components/global/data-loading";
import { FormattedNumber } from "@/components/global/formatted-number";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { UnderlineTabs } from "@/components/underline-tabs";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { amountColorClass } from "@/lib/amount-color";
import { getCollectionStatus } from "@/lib/get-collection-status";
import { PaymentTransactionPanel } from "@/components/entities/admin/dashboard/collections/payment-transaction-panel";
import { InvoiceActionPanel } from "@/components/entities/admin/dashboard/invoices/invoice-action-panel";

export default function Page(props: PageProps<"/dashboard/buyers/[id]/invoice/[invoiceId]">) {
	const { invoiceId, id } = use(props.params);
	const { t } = useTranslationContext();
	const searchParams = useSearchParams();
	const salesOrderId = searchParams.get("salesOrderId");
	const salesOrderRef = searchParams.get("salesOrderRef");
	const fromSupplierId = searchParams.get("fromSupplierId");
	const fromInvoiceList = searchParams.get("fromInvoiceList");
	const fromSalesOrdersList = searchParams.get("fromSalesOrdersList");
	const invoiceListStatus = searchParams.get("status");
	const [collection, setCollection] = useState<ICollection | null>(null);
	const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "installments");
	const [deleteInvoiceId, setDeleteInvoiceId] = useState<number | null>(null);

	const { data, isLoading } = useFetchInvoice({
		id: invoiceId,
	});

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						href: fromInvoiceList
							? `/dashboard/invoices?status=${invoiceListStatus ?? ""}`
							: fromSupplierId
								? `/dashboard/suppliers/${fromSupplierId}?tab=invoices`
								: fromSalesOrdersList
									? config.PATHS.dashboard.ADMIN.salesOrders
									: `/dashboard/buyers/${id}`,
						position: 0,
						title: fromInvoiceList
							? t("admin.collectors.invoice-list")
							: fromSupplierId
								? data?.invoice?.supplier?.supplierName
								: fromSalesOrdersList
									? t("admin.buyers.list-of-sales-orders")
									: data?.invoice?.buyer?.buyerName,
					},
					{
						href: salesOrderId
							? `${config.PATHS.dashboard.ADMIN.salesOrder(Number(salesOrderId), Number(id))}${fromSalesOrdersList ? "?fromSalesOrdersList=1" : ""}`
							: null,
						position: 1,
						title: salesOrderRef ?? null,
					},
					{
						position: 2,
						title: null,
					},
					{
						position: 3,
						title: data?.invoice?.invoiceReference || data?.invoice?.reference,
					},
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={data?.invoice}>
				{invoice => {
					const processedCollections = invoice.collections.map(col => {
						const amount = Number(col.amount || 0);
						const appliedAmount = Number(col.appliedAmount || 0);

						return {
							...col,
							invoiceReference: invoice.invoiceReference || invoice.reference || "-",
							amount,
							appliedAmount,
							remainingAmount: Math.max(amount - appliedAmount, 0),
						};
					});
					const isPendingDelivery =
						invoice.status === "Confirm Delivery" || (!invoice.isCancelled && (!invoice.deliveryAmount || !invoice.deliveryDate));

					return (
						<div className="flex h-full flex-col gap-4 px-4 py-4">
							<InvoiceInformation
								{...invoice}
								action={
									isPendingDelivery ? (
										<ConfirmInvoiceDelivery {...invoice} onConfirmed={() => setActiveTab("details")} />
									) : undefined
								}
							/>

							{isPendingDelivery ? null : (
								<>
									<div className="flex items-center justify-between">
										<UnderlineTabs
											options={[
												{ label: t("admin.invoices.installments"), value: "installments" },
												{ label: t("admin.invoices.payment-history"), value: "payment-history" },
												{ label: t("admin.invoices.invoice-details"), value: "details" },
												{ label: t("admin.common.invoice-action"), value: "action" },
											]}
											selected={activeTab}
											onChange={setActiveTab}
										/>
									</div>

									{activeTab === "installments" && (
										<>
											<div className="flex overflow-hidden rounded-xl border border-gray-100">
												<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
												<DataTable
													className="flex-1"
													data={processedCollections.filter(col => col.isCurrent)}
													headers={[
														/* {
															label: t("admin.invoices.number"),
															render: (_, __, idx) => idx + 1,
														}, */
														{
															key: "invoiceReference",
															label: "Invoice Reference",
															render: value => (value != null ? String(value) : "-"),
														},
														{
															key: "id",
															label: "Collection ID",
															render: value => (value != null ? String(value) : "-"),
														},

														{
															key: "eligibleAt",
															label: t("admin.invoices.Eligible At"),
															render: value => dayjs(value).format("DD MMM, YYYY"),
														},
														{
															alignment: "right",
															key: "amount",
															label: <RiyalTitle>{t("admin.invoices.amount")}</RiyalTitle>,
															render: value => <FormattedNumber value={value} />,
														},
														{
															alignment: "right",
															key: "appliedAmount",
															label: <RiyalTitle>{t("admin.invoices.paid-amount")}</RiyalTitle>,
															render: value => <FormattedNumber className={amountColorClass(value, "positive")} value={value} />,
														},
														{
															alignment: "right",
															key: "remainingAmount",
															label: <RiyalTitle>{t("admin.invoices.remaining-amount")}</RiyalTitle>,
															render: value => <FormattedNumber className={amountColorClass(value, "negative")} value={value} />,
														},
														{
															label: t("admin.invoices.status"),
															render: (_, collection) => (
																<div className="flex items-center justify-between">
																	<CollectionStatusPill collection={collection} />
																</div>
															),
														},
													]}
													isRowClickable={row => getCollectionStatus(row) !== "Paid"}
													onClick={row => {
														if (getCollectionStatus(row) !== "Paid") {
															setCollection(row);
														}
													}}
												/>
											</div>

										{/* 	<CollectionPopUp collection={collection} setCollection={setCollection} /> */}
										</>
									)}

									{activeTab === "payment-history" && (
										<PaymentTransactionPanel
											buyerId={Number(id)}
											invoiceId={Number(invoiceId)}
											salesOrderId={salesOrderId ? Number(salesOrderId) : undefined}
										/>
									)}

									{activeTab === "details" && (
										<InvoiceDetailsForm {...invoice} salesOrderReference={salesOrderRef ?? undefined} />
									)}

									{activeTab === "action" && (
										<InvoiceActionPanel
											invoiceId={Number(invoiceId)}
											buyerId={Number(id)}
											salesOrderId={salesOrderId ? Number(salesOrderId) : undefined}
											salesOrderRef={salesOrderRef}
										/>
									)}
								</>
							)}
						</div>
					);
				}}
			</DataLoading>

			{deleteInvoiceId && (
				<DeleteInvoicePopUp
					invoiceId={deleteInvoiceId}
					open
					onOpenChange={open => {
						if (!open) setDeleteInvoiceId(null);
					}}
				/>
			)}
		</>
	);
}
