"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { useFetchCollector } from "@/api/endpoints/back-office/collectors/fetch-collector";
import { useFetchCollectorBuyers } from "@/api/endpoints/back-office/collectors/fetch-collector-buyers";
import { useFetchBuyers } from "@/api/endpoints/back-office/buyers/fetch-buyers";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { useFetchInvoices } from "@/api/endpoints/back-office/invoices/fetch-invoices";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
import { IInvoice } from "@/api/types";
import { CollectorInformation } from "@/components/entities/admin/collectors/collector-information";
import { DeleteBuyerPopUp } from "@/components/entities/admin/dashboard/buyers/delete-buyer-pop-up";
import { EditInvoicePopup } from "@/components/entities/admin/dashboard/invoices/edit-invoice-popup";
import { DeleteInvoicePopUp } from "@/components/entities/admin/dashboard/invoices/invoice-delete-popup";
import { DataLoading } from "@/components/global/data-loading";
import { FormattedNumber } from "@/components/global/formatted-number";
import { Icon } from "@/components/global/icon";
import { RiyalTitle } from "@/components/global/riyal-title";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/global/pagination";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { amountColorClass } from "@/lib/amount-color";

export default function Page(props: PageProps<"/dashboard/collectors/[id]">) {
	const { id } = use(props.params);

	const { t } = useTranslationContext();
	const router = useRouter();
	const [deleteInvoiceId, setDeleteInvoiceId] = useState<number | null>(null);
	const [deleteBuyerId, setDeleteBuyerId] = useState<number | null>(null);
	const [editInvoice, setEditInvoice] = useState<IInvoice | null>(null);

	const searchParams = useSearchParams();
	const setParams = useSetParams();

	const invoicesQ = searchParams.get("invoicesSearch") || "";
	const invoicesFilterBy = (searchParams.get("invoicesFilterBy") || "all") as "all" | "supplier" | "financier" | "buyer";
	const invoicesSupplierId = searchParams.get("invoicesSupplierId");
	const invoicesFinancierId = searchParams.get("invoicesFinancierId");
	const invoicesBuyerId = searchParams.get("invoicesBuyerId");
	const invoicesBuyerName = searchParams.get("invoicesBuyerName") || "";
	const [supplierInput, setSupplierInput] = useState("");
	const [pendingSupplierId, setPendingSupplierId] = useState<string | null>(null);
	const [isSupplierListOpen, setIsSupplierListOpen] = useState(false);
	const [financierInput, setFinancierInput] = useState("");
	const [pendingFinancierId, setPendingFinancierId] = useState<string | null>(null);
	const [isFinancierListOpen, setIsFinancierListOpen] = useState(false);
	const [buyerInput, setBuyerInput] = useState("");
	const [pendingBuyerId, setPendingBuyerId] = useState<string | null>(null);
	const [pendingBuyerName, setPendingBuyerName] = useState<string | null>(null);
	const [isBuyerListOpen, setIsBuyerListOpen] = useState(false);
	const buyersQ = invoicesFilterBy === "buyer" && invoicesBuyerName ? invoicesBuyerName : searchParams.get("buyersSearch") || "";

	const iPage = Number(searchParams.get("iPage") || "1");
	const iPageSize = Number(
		searchParams.get("iPageSize") ||
			localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) ||
			config.COLLECTOR_INVOICE_LIST_PAGE_SIZE,
	);
	const bPage = Number(searchParams.get("bPage") || "1");
	const bPageSize = Number(
		searchParams.get("bPageSize") ||
			localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) ||
			config.COLLECTOR_BUYER_LIST_PAGE_SIZE,
	);

	const iSortBy = searchParams.get("iSortBy") || "id";
	const iSortOrder = (searchParams.get("iSortOrder") || "desc") as "asc" | "desc";

	// Every column here is sortable server-side: real DB columns plus backend-computed aliases the
	// invoices service can order by directly (status, calcOutstanding, calcOverdue, calcPaidAmount).
	// Buyer/supplier/financier facility names are intentionally not sortable (see those headers
	// below): mixed Arabic/English facility names don't sort sensibly under one collation.
	const invoicesServerSortableKeys = new Set([
		"id",
		"invoiceReference",
		"deliveryDate",
		"deliveryAmount",
		"calcPaidAmount",
		"outstandingAmount",
		"calcOverdue",
		"status",
	]);
	const isInvoicesClientSort = !!iSortBy && !invoicesServerSortableKeys.has(iSortBy);
	// The row/header keys don't always match the backend column/alias name. "outstandingAmount" is
	// the header key (and what's displayed via row.calcOutstanding), but the backend's own
	// "outstandingAmount" column uses a different formula than what's shown — sort by "calcOutstanding"
	// instead to keep sort order consistent with what's on screen.
	const invoicesBackendSortByMap: Record<string, string> = {
		invoiceReference: "reference",
		outstandingAmount: "calcOutstanding",
	};
	const invoicesBackendSortBy = invoicesBackendSortByMap[iSortBy] ?? iSortBy;

	const { data, isLoading } = useFetchCollector({
		id,
	});

	const { data: invoicesData, isLoading: isLoadingInvoices } = useFetchInvoices(
		isInvoicesClientSort
			? {
					buyerId: invoicesFilterBy === "buyer" && invoicesBuyerId ? invoicesBuyerId : undefined,
					collectorId: id,
					financierId: invoicesFilterBy === "financier" && invoicesFinancierId ? invoicesFinancierId : undefined,
					q: invoicesQ,
					supplierId: invoicesFilterBy === "supplier" && invoicesSupplierId ? invoicesSupplierId : undefined,
				}
			: {
					buyerId: invoicesFilterBy === "buyer" && invoicesBuyerId ? invoicesBuyerId : undefined,
					collectorId: id,
					financierId: invoicesFilterBy === "financier" && invoicesFinancierId ? invoicesFinancierId : undefined,
					limit: iPageSize,
					page: iPage,
					q: invoicesQ,
					sortBy: invoicesBackendSortBy,
					sortOrder: iSortOrder,
					supplierId: invoicesFilterBy === "supplier" && invoicesSupplierId ? invoicesSupplierId : undefined,
				},
	);

	const sortedInvoices = isInvoicesClientSort
		? [...(invoicesData?.invoices ?? [])].sort((a, b) => {
				const getSortValue = (row: any) => {
					if (iSortBy === "calcPaidAmount") return Number(row.calcPaidAmount ?? row.calcPaid ?? 0);
					return Number(row[iSortBy] ?? 0);
				};
				const aVal = getSortValue(a);
				const bVal = getSortValue(b);
				if (typeof aVal === "string" || typeof bVal === "string") {
					return iSortOrder === "asc"
						? String(aVal).localeCompare(String(bVal))
						: String(bVal).localeCompare(String(aVal));
				}
				return iSortOrder === "asc" ? aVal - bVal : bVal - aVal;
			})
		: (invoicesData?.invoices ?? []);

	const pagedInvoices = isInvoicesClientSort
		? sortedInvoices.slice((iPage - 1) * iPageSize, (iPage - 1) * iPageSize + iPageSize)
		: sortedInvoices;

	const { data: suppliersData, isLoading: isSuppliersLoading } = useFetchSuppliers(
		{ q: supplierInput },
		{ enabled: invoicesFilterBy === "supplier" && !pendingSupplierId },
	);
	const { data: financiersData, isLoading: isFinanciersLoading } = useFetchFinanciers(
		{ q: financierInput },
		{ enabled: invoicesFilterBy === "financier" && !pendingFinancierId },
	);
	const { data: buyersListData, isLoading: isBuyersLoading } = useFetchBuyers(
		{ q: buyerInput },
		{ enabled: invoicesFilterBy === "buyer" && !pendingBuyerId },
	);

	const { data: buyersData } = useFetchCollectorBuyers({
		financierId: invoicesFilterBy === "financier" && invoicesFinancierId ? invoicesFinancierId : undefined,
		id,
		limit: bPageSize,
		page: bPage,
		q: buyersQ,
		supplierId: invoicesFilterBy === "supplier" && invoicesSupplierId ? invoicesSupplierId : undefined,
	});

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.collectors.list-of-collectors"),
					},
					{
						position: 1,
						title: data?.collector.collectorName,
					},
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={data?.collector}>
				{collector => (
					<div className="flex h-full flex-col gap-4 px-4 py-4">
						<CollectorInformation
							{...collector}
							collectorSummary={invoicesData?.collectorSummary}
							invoicesAmount={buyersData?.buyers?.reduce((sum, b) => sum + (b.remainingAmount || 0), 0) ?? collector.invoicesAmount}
							totalInvoicesCount={invoicesData?.totalCount}
						/>

						<div className="flex flex-col gap-3">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<label className="font-bold">{t("admin.collectors.invoice-list")}</label>

								<div className="flex flex-wrap items-center gap-3">
									<div className="flex items-center gap-2">
										{(
											[
												{ label: t("admin.collectors.search-by-all"), value: "all" as const },
												{ label: t("admin.collectors.search-by-supplier"), value: "supplier" as const },
												{ label: t("admin.collectors.search-by-financier"), value: "financier" as const },
												{ label: t("admin.collectors.search-by-buyer"), value: "buyer" as const },
											]
										).map(option => (
											<button
												key={option.value}
												className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
													invoicesFilterBy === option.value
														? "border-[#2D8BC9] bg-[#2D8BC9] text-white shadow-sm"
														: "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
												}`}
												type="button"
												onClick={() =>
													setParams({
														iPage: null,
														invoicesBuyerId: option.value === "buyer" ? invoicesBuyerId : null,
														invoicesBuyerName: option.value === "buyer" ? invoicesBuyerName : null,
														invoicesFilterBy: option.value === "all" ? null : option.value,
														invoicesFinancierId: option.value === "financier" ? invoicesFinancierId : null,
														invoicesSupplierId: option.value === "supplier" ? invoicesSupplierId : null,
													})
												}
											>
												{option.label}
											</button>
										))}
									</div>

									{invoicesFilterBy === "supplier" && (
										<div className="relative w-full min-w-[220px] sm:w-80">
											<div className="flex items-center gap-2">
												<Input
													className="h-9 flex-1"
													placeholder={t("admin.collectors.search-by-supplier-placeholder")}
													value={supplierInput}
													onChange={e => {
														setSupplierInput(e.target.value);
														setPendingSupplierId(null);
													}}
													onFocus={() => setIsSupplierListOpen(true)}
													onBlur={() => setTimeout(() => setIsSupplierListOpen(false), 150)}
												/>
												<Button
													className="h-9 w-9 p-0"
													disabled={!pendingSupplierId}
													size="sm"
													type="button"
													variant="outline"
													onClick={() => setParams({ iPage: null, invoicesSupplierId: pendingSupplierId })}
												>
													<Icon className="h-4 w-4 text-black" name="Search" />
												</Button>
												{(invoicesSupplierId || supplierInput) && (
													<Button
														size="sm"
														type="button"
														variant="ghost"
														onClick={() => {
															setSupplierInput("");
															setPendingSupplierId(null);
															setParams({ iPage: null, invoicesSupplierId: null });
														}}
													>
														<Icon className="h-4 w-4" name="X" />
													</Button>
												)}
											</div>

											{isSupplierListOpen && !pendingSupplierId && (
												<div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
													{isSuppliersLoading && (
														<div className="p-3 text-sm text-gray-400">{t("global.loading")}</div>
													)}
													{!isSuppliersLoading && (suppliersData?.suppliers || []).length === 0 && (
														<div className="p-3 text-sm text-gray-400">{t("global.no-data-found")}</div>
													)}
													{!isSuppliersLoading &&
														(suppliersData?.suppliers || []).map(supplier => (
															<button
																key={supplier.id}
																className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
																type="button"
																onMouseDown={e => e.preventDefault()}
																onClick={() => {
																	setSupplierInput(supplier.facilityName);
																	setPendingSupplierId(String(supplier.id));
																	setIsSupplierListOpen(false);
																}}
															>
																{supplier.facilityName}
															</button>
														))}
												</div>
											)}
										</div>
									)}

									{invoicesFilterBy === "financier" && (
										<div className="relative w-full min-w-[220px] sm:w-80">
											<div className="flex items-center gap-2">
												<Input
													className="h-9 flex-1"
													placeholder={t("admin.collectors.search-by-financier-placeholder")}
													value={financierInput}
													onChange={e => {
														setFinancierInput(e.target.value);
														setPendingFinancierId(null);
													}}
													onFocus={() => setIsFinancierListOpen(true)}
													onBlur={() => setTimeout(() => setIsFinancierListOpen(false), 150)}
												/>
												<Button
													className="h-9 w-9 p-0"
													disabled={!pendingFinancierId}
													size="sm"
													type="button"
													variant="outline"
													onClick={() => setParams({ iPage: null, invoicesFinancierId: pendingFinancierId })}
												>
													<Icon className="h-4 w-4 text-black" name="Search" />
												</Button>
												{(invoicesFinancierId || financierInput) && (
													<Button
														size="sm"
														type="button"
														variant="ghost"
														onClick={() => {
															setFinancierInput("");
															setPendingFinancierId(null);
															setParams({ iPage: null, invoicesFinancierId: null });
														}}
													>
														<Icon className="h-4 w-4" name="X" />
													</Button>
												)}
											</div>

											{isFinancierListOpen && !pendingFinancierId && (
												<div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
													{isFinanciersLoading && (
														<div className="p-3 text-sm text-gray-400">{t("global.loading")}</div>
													)}
													{!isFinanciersLoading && (financiersData?.financiers || []).length === 0 && (
														<div className="p-3 text-sm text-gray-400">{t("global.no-data-found")}</div>
													)}
													{!isFinanciersLoading &&
														(financiersData?.financiers || []).map(financier => (
															<button
																key={financier.id}
																className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
																type="button"
																onMouseDown={e => e.preventDefault()}
																onClick={() => {
																	setFinancierInput(financier.facilityName);
																	setPendingFinancierId(String(financier.id));
																	setIsFinancierListOpen(false);
																}}
															>
																{financier.facilityName}
															</button>
														))}
												</div>
											)}
										</div>
									)}

									{invoicesFilterBy === "buyer" && (
										<div className="relative w-full min-w-[220px] sm:w-80">
											<div className="flex items-center gap-2">
												<Input
													className="h-9 flex-1"
													placeholder={t("admin.collectors.search-by-buyer-placeholder")}
													value={buyerInput}
													onChange={e => {
														setBuyerInput(e.target.value);
														setPendingBuyerId(null);
														setPendingBuyerName(null);
													}}
													onFocus={() => setIsBuyerListOpen(true)}
													onBlur={() => setTimeout(() => setIsBuyerListOpen(false), 150)}
												/>
												<Button
													className="h-9 w-9 p-0"
													disabled={!pendingBuyerId}
													size="sm"
													type="button"
													variant="outline"
													onClick={() =>
														setParams({
															iPage: null,
															invoicesBuyerId: pendingBuyerId,
															invoicesBuyerName: pendingBuyerName,
														})
													}
												>
													<Icon className="h-4 w-4 text-black" name="Search" />
												</Button>
												{(invoicesBuyerId || buyerInput) && (
													<Button
														size="sm"
														type="button"
														variant="ghost"
														onClick={() => {
															setBuyerInput("");
															setPendingBuyerId(null);
															setPendingBuyerName(null);
															setParams({ iPage: null, invoicesBuyerId: null, invoicesBuyerName: null });
														}}
													>
														<Icon className="h-4 w-4" name="X" />
													</Button>
												)}
											</div>

											{isBuyerListOpen && !pendingBuyerId && (
												<div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
													{isBuyersLoading && (
														<div className="p-3 text-sm text-gray-400">{t("global.loading")}</div>
													)}
													{!isBuyersLoading && (buyersListData?.buyers || []).length === 0 && (
														<div className="p-3 text-sm text-gray-400">{t("global.no-data-found")}</div>
													)}
													{!isBuyersLoading &&
														(buyersListData?.buyers || []).map(buyer => (
															<button
																key={buyer.id}
																className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
																type="button"
																onMouseDown={e => e.preventDefault()}
																onClick={() => {
																	setBuyerInput(buyer.buyerName);
																	setPendingBuyerId(String(buyer.id));
																	setPendingBuyerName(buyer.buyerName);
																	setIsBuyerListOpen(false);
																}}
															>
																{buyer.buyerName}
															</button>
														))}
												</div>
											)}
										</div>
									)}
								</div>
							</div>

							<div className="flex overflow-hidden rounded-xl border border-gray-100">
								<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
								<DataTable
									className="flex-1"
									data={pagedInvoices}
									headers={[
										{
											key: "invoiceReference",
											label: t("admin.suppliers.invoice-number"),
											sortable: true,
										},
										{
											key: "buyer",
											label: t("admin.suppliers.buyer-name"),
											render: (_, row) => row.buyer?.buyerName,
										},
										{
											key: "supplier",
											label: t("admin.collectors.supplier-facility-name"),
											render: (_, row) => row.supplier?.facilityName,
										},
										{
											key: "financierFacilityName",
											label: t("admin.collectors.financier-facility-name"),
											render: (_, row) => row.financierFacilityName,
										},
										/* {
											alignment: "right",
											key: "invoiceAmount",
											label: <RiyalTitle>{t("admin.suppliers.invoice-amount")}</RiyalTitle>,
											render: value => <FormattedNumber value={value} />,
										}, */
										{
											alignment: "right",
											key: "deliveryAmount",
											label: <RiyalTitle>{t("admin.collectors.delivery-amount")}</RiyalTitle>,
											sortable: true,
											render: value => <FormattedNumber value={value} />,
										},
										{
											alignment: "right",
											key: "calcPaidAmount",
											label: <RiyalTitle>{t("admin.collectors.paid-amount")}</RiyalTitle>,
											sortable: true,
											render: (_, row) => {
												const paidAmount = (row as any).calcPaidAmount || (row as any).calcPaid || 0;
												return <FormattedNumber className={amountColorClass(paidAmount, "positive")} value={paidAmount} />;
											},
										},
									 	{
											alignment: "right",
											key: "outstandingAmount",
											label: <RiyalTitle>{t("admin.collectors.remaining-amount")}</RiyalTitle>,
											sortable: true,
											render: (_, row) => {
												const value = (row as any).calcOutstanding ?? 0;
													return <FormattedNumber className={amountColorClass(value, "negative")} value={value} />;
											},
										},
										{
											alignment: "right",
											key: "calcOverdue",
											label: <RiyalTitle>{t("admin.collectors.total-overdue")}</RiyalTitle>,
											sortable: true,
											render: (_, row) => {
												const overdueAmount = row.calcOverdue || 0;

												return overdueAmount ? <FormattedNumber className={amountColorClass(overdueAmount, "overdue")} value={overdueAmount} /> : "0";
											},
										},
									]}
									loading={isLoadingInvoices}
									sortKey={iSortBy}
									sortOrder={iSortOrder}
									onSortBy={(key, dir) => setParams({ iPage: null, iSortBy: key || "", iSortOrder: dir })}
									onClick={row => router.push(config.PATHS.dashboard.ADMIN.invoice(row.id, row.buyerId ?? row.buyer?.id))}
									/* onOpen={row => router.push(config.PATHS.dashboard.ADMIN.invoice(row.id, row.buyerId))}
									onEdit={row => setEditInvoice(row)}
									onDelete={row => setDeleteInvoiceId(row.id)}
									deleteLabel={t("admin.common.cancel")} */
								/>
							</div>

							<Pagination
								currentCount={pagedInvoices.length}
								page={iPage}
								perPage={iPageSize}
								setPage={iPage => setParams({ iPage })}
								setPerPage={iPageSize => setParams({ iPage: null, iPageSize })}
								totalCount={invoicesData?.totalCount || 0}
								showing
							/>
						</div>

						<div className="flex flex-col gap-2">
							<div className="flex items-end justify-between">
								<label className="font-bold">{t("admin.collectors.buyer-list")}</label>

								{/* <div className="flex gap-2">
									<Input
										className="flex-1 h-8"
										defaultValue={buyersQ}
										icon={<Icon className="h-4 w-4" name="Search" />}
										iconPosition="right"
										placeholder={t("admin.buyer.search-here-placeholder")}
										type="text"
										onChange={e => setDebouncedBuyersSearch(e.target.value)}
									/>
								</div> */}
							</div>

							<div className="flex overflow-hidden rounded-xl border border-gray-100">
								<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
								<DataTable
									className="flex-1"
									data={buyersData?.buyers}
									headers={[
										{ key: "buyerName", label: t("admin.collectors.buyer-name") },
										{
											key: "invoicesCount",
											label: t("admin.collectors.number-of-invoices"),
										},
										{
											alignment: "right",
											key: "deliveryAmount",
											label: <RiyalTitle>{t("admin.collectors.delivery-amount")}</RiyalTitle>,
											render: value => <FormattedNumber value={value} />,
										},
										{
											alignment: "right",
											key: "paidAmount",
											label: <RiyalTitle>{t("admin.collectors.paid-amount")}</RiyalTitle>,
											render: value => <FormattedNumber className={amountColorClass(value, "positive")} value={value} />,
										},
										{
											alignment: "right",
											key: "remainingAmount",
											label: <RiyalTitle>{t("admin.collectors.total-outstanding")}</RiyalTitle>,
											render: value => <FormattedNumber className={amountColorClass(value, "negative")} value={value} />,
										},
										{
											alignment: "right",
											key: "overdueAmount",
											label: <RiyalTitle>{t("admin.collectors.total-overdue")}</RiyalTitle>,
											render: value => <FormattedNumber className={amountColorClass(value, "overdue")} value={value} />,
										},
										/* {
											label: t("admin.collectors.additional-information"),
											render: (_, row) => row.additionalInfo?.comments,
										}, */
									]}
									onClick={row => router.push(config.PATHS.dashboard.ADMIN.buyer(row.id))}
									onOpen={row => router.push(config.PATHS.dashboard.ADMIN.buyer(row.id))}
									onEdit={row => router.push(config.PATHS.dashboard.ADMIN.buyer(row.id))}
									onDelete={row => setDeleteBuyerId(row.id)}
								/>
							</div>

							<Pagination
								currentCount={buyersData?.buyers.length || 0}
								page={bPage}
								perPage={bPageSize}
								setPage={bPage => setParams({ bPage })}
								setPerPage={bPageSize => setParams({ bPage: null, bPageSize })}
								totalCount={buyersData?.totalCount || 0}
								showing
							/>
						</div>
					</div>
				)}
			</DataLoading>

			<EditInvoicePopup
				invoice={editInvoice}
				open={!!editInvoice}
				onOpenChange={open => {
					if (!open) setEditInvoice(null);
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

			{deleteBuyerId && (
				<DeleteBuyerPopUp
					buyerId={deleteBuyerId}
					open
					onOpenChange={open => {
						if (!open) setDeleteBuyerId(null);
					}}
				/>
			)}
		</>
	);
}