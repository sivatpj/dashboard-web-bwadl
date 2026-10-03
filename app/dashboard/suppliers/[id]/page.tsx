"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { useFetchInvoices } from "@/api/endpoints/back-office/invoices/fetch-invoices";
import { useFetchSupplier } from "@/api/endpoints/back-office/suppliers/fetch-supplier";
import { IFinancierOffer, IInvoice } from "@/api/types";
import { EditInvoicePopup } from "@/components/entities/admin/dashboard/invoices/edit-invoice-popup";
import { DeleteInvoicePopUp } from "@/components/entities/admin/dashboard/invoices/invoice-delete-popup";
import { InvoiceStatusPill } from "@/components/entities/admin/dashboard/invoices/invoice-status-pill";
import { SupplierInformation } from "@/components/entities/admin/dashboard/suppliers/supplier-information";
import { AddNewOfferPopup } from "@/components/entities/admin/financiers/add-new-offer-popup";
import { DeleteContractOfferPopUp } from "@/components/entities/admin/financiers/delete-contract-offer-pop-up";
import { EditFinancierOfferPopUp } from "@/components/entities/admin/financiers/edit-financier-offer-pop-up";
import { EditContract } from "@/components/entities/admin/dashboard/suppliers/edit-contract";
import { DeleteContractPopUp } from "@/components/entities/admin/dashboard/suppliers/delete-contract-popup";
import { DataLoading } from "@/components/global/data-loading";
import { FormattedNumber } from "@/components/global/formatted-number";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/global/pagination";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

export default function Page(props: PageProps<"/dashboard/suppliers/[id]">) {
  const { id } = use(props.params);
  const { t } = useTranslationContext();
  const router = useRouter();

  const { data, isLoading } = useFetchSupplier({
    id,
  });

  const searchParams = useSearchParams();
  const setParams = useSetParams();

  const iPage = Number(searchParams.get("iPage") || "1");
  const iPageSize = Number(
    searchParams.get("iPageSize") ||
      localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) ||
      config.SUPPLIER_INVOICE_LIST_PAGE_SIZE,
  );

  const iSortBy = searchParams.get("iSortBy") || "id";
  const iSortOrder = (searchParams.get("iSortOrder") || "desc") as "asc" | "desc";

  // Every column here is sortable server-side: real DB columns plus the "status" alias the
  // invoices service can order by directly. Buyer name is intentionally not sortable (see the
  // "buyer" header below): mixed Arabic/English facility names don't sort sensibly under one
  // collation. There's no "outstanding" column on this table, so it's not listed here.
  const invoicesServerSortableKeys = new Set(["id", "invoiceReference", "deliveryDate", "deliveryAmount", "status"]);
  const isInvoicesClientSort = !!iSortBy && !invoicesServerSortableKeys.has(iSortBy);
  // The backend column is "reference"; the row/header key is "invoiceReference" (matches IInvoice).
  const invoicesBackendSortBy = iSortBy === "invoiceReference" ? "reference" : iSortBy;

  const { data: invoicesData, isLoading: isLoadingInvoices } = useFetchInvoices(
    isInvoicesClientSort
      ? { supplierId: id }
      : {
          limit: iPageSize,
          page: iPage,
          sortBy: invoicesBackendSortBy,
          sortOrder: iSortOrder,
          supplierId: id,
        },
  );

  const sortedInvoices = isInvoicesClientSort
    ? [...(invoicesData?.invoices ?? [])].sort((a, b) => {
        const getSortValue = (row: any) => Number(row[iSortBy] ?? 0);
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

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "details",
  );
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(
    new Set(),
  );
  const [selectedOffer, setSelectedOffer] = useState<{
    contractId: number;
    offer: IFinancierOffer;
  } | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<number | null>(null);
  const [editInvoice, setEditInvoice] = useState<IInvoice | null>(null);

  const toggleContract = (contractId: number) => {
    setExpandedContracts((prev) => {
      const next = new Set(prev);
      if (next.has(contractId)) {
        next.delete(contractId);
      } else {
        next.add(contractId);
      }
      return next;
    });
  };

  const latestInvoice = invoicesData?.invoices?.[0];
  const latestInvoiceInfo = latestInvoice
    ? {
        buyerName: (latestInvoice as any).buyer?.buyerName,
        calcDifference: latestInvoice.calcDifference,
        calcDiscount: latestInvoice.calcDiscount,
        collectorName: (latestInvoice as any).collector?.collectorName,
        deliveryAmount: latestInvoice.deliveryAmount,
        deliveryDate: latestInvoice.deliveryDate,
        financingAmount: latestInvoice.financingAmount,
        financingDate: latestInvoice.financingDate,
        insurerName: (latestInvoice as any).insurer?.insurerName,
        supplierName: data?.supplier?.supplierName,
      }
    : undefined;

  return (
    <>
      <BreadcrumbTitles
        crumbs={[
          {
            position: 0,
            title: t("admin.suppliers.list-of-suppliers"),
          },
          {
            position: 1,
            title: data?.supplier.supplierName,
          },
        ]}
        isLoading={isLoading}
      />

      <DataLoading isLoading={isLoading} data={data?.supplier}>
        {(supplier) => (
          <div className="flex h-full flex-col gap-4 px-4 py-4">
            <SupplierInformation
              supplier={supplier}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              latestInvoice={latestInvoiceInfo}
            />

            {/* Contracts List Tab */}
            {activeTab === "contracts" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-end justify-between">
                  <label className="font-bold">
                    {t("admin.suppliers.contracts-list")}
                  </label>
                  <AddNewOfferPopup
                    contracts={supplier.financierSupplierContracts}
                    supplierId={+id}
                  />
                </div>

                <div className="flex overflow-hidden rounded-xl border border-gray-100">
                  <div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
                  <div className="flex-1">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
                          <th className="px-4 py-3">
                            {t("admin.suppliers.contract-name")}
                          </th>
                          <th className="px-4 py-3">
                            {t("admin.suppliers.financier-name")}
                          </th>
                          <th className="px-4 py-3">
                            {t("admin.financiers.contract-start-date")}
                          </th>
                          {/* <th className="px-4 py-3">{t("admin.suppliers.advance-percentage")}</th> */}
                          <th className="py-3 pr-4">
                            <RiyalTitle>
                              {t("admin.suppliers.advance-cap")}
                            </RiyalTitle>
                          </th>
                          <th className="py-3 pr-4">
                            <RiyalTitle>
                              {t("admin.suppliers.available-advance")}
                            </RiyalTitle>
                          </th>
                          <th className="py-3 pr-4">
                            <RiyalTitle>
                              {t("admin.suppliers.consumed-limit")}
                            </RiyalTitle>
                          </th>
                          {/* <th className="px-4 py-3">{t("admin.suppliers.additional-information")}</th> */}
                          <th className="px-4 py-3" />
                          <th className="w-10 px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {supplier.financierSupplierContracts.map((contract) => {
                          const isExpanded = expandedContracts.has(contract.id);
                          const offers = contract.financierOffers ?? [];
                          const pct =
                            (contract as any).supplierAdvancePercentage ??
                            contract.additionalInfo?.advancePercentage;

                          return (
                            <>
                              <tr
                                key={`contract-${contract.id}`}
                                className="cursor-pointer border-b bg-white text-sm hover:bg-gray-50"
                                onClick={() => toggleContract(contract.id)}
                              >
                                <td className="px-4 py-3">{contract.name}</td>
                                <td className="px-4 py-3">
                                  {contract.financier.financierName}
                                </td>
                                <td className="px-4 py-3">
                                  {contract.additionalInfo?.contractStartDate
                                    ? dayjs(
                                        contract.additionalInfo
                                          .contractStartDate,
                                      ).format("DD MMM, YYYY")
                                    : "-"}
                                </td>
                                {/* <td className="px-4 py-3">{pct != null ? `${Number(pct).toFixed(2)} %` : "-"}</td> */}
                                <td className="px-4 py-3">
                                  <FormattedNumber
                                    value={contract.advanceCap}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <FormattedNumber
                                    value={contract.availableAdvance}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <FormattedNumber
                                    value={
                                      contract.advanceCap -
                                      contract.availableAdvance
                                    }
                                  />
                                </td>
                                {/* <td className="px-4 py-3">{contract.additionalInfo?.comments || "-"}</td> */}
                                <td
                                  className="flex items-center gap-2 px-4 py-3"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <EditContract {...contract} />
                                  <DeleteContractPopUp contractId={contract.id} />
                                </td>
                                <td className="px-4 py-3">
                                  <ChevronDown
                                    className={cn(
                                      "h-4 w-4 transition-transform",
                                      isExpanded && "rotate-180",
                                    )}
                                  />
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr
                                  key={`offers-${contract.id}`}
                                  className="bg-transparent"
                                >
                                  <td
                                    colSpan={7}
                                    className="bg-transparent px-8 py-4"
                                  >
                                    <div className="ml-auto w-fit">
                                      <table className="rounded-md bg-white">
                                        <thead>
                                          <tr className="border-b text-left text-sm font-medium text-gray-500">
                                            <th className="px-4 py-2">
                                              {t(
                                                "admin.sales-orders.offer-name",
                                              )}
                                            </th>
                                            <th className="px-4 py-2">
                                              {t(
                                                "admin.financiers.supplier-advance-percentage",
                                              )}
                                            </th>
                                            <th className="px-4 py-2">
                                              {t(
                                                "admin.financiers.financing-date-offset",
                                              )}
                                            </th>
                                            <th className="px-4 py-2">
                                              {t(
                                                "admin.financiers.repayment-period",
                                              )}
                                            </th>
                                            <th className="px-4 py-2">
                                              {t(
                                                "admin.financiers.installment-number",
                                              )}
                                            </th>
                                            <th className="px-4 py-2">
                                              {t("admin.suppliers.discount")}
                                            </th>
                                            <th className="px-4 py-2">
                                              {t(
                                                "admin.financiers.financier-financial-share",
                                              )}
                                            </th>
                                            <th className="px-4 py-2">
                                              {t(
                                                "admin.financiers.insurer-financial-share",
                                              )}
                                            </th>
                                            <th className="px-4 py-2">
                                              {t(
                                                "admin.financiers.collector-financial-share",
                                              )}
                                            </th>
                                            <th className="px-4 py-2">
                                              {t(
                                                "admin.financiers.bwadl-financial-share",
                                              )}
                                            </th>
                                            <th className="w-10 px-4 py-2" />
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {offers.map((offer) => (
                                            <tr
                                              key={`offer-${offer.id}`}
                                              className="cursor-pointer border-b text-sm hover:bg-gray-50 last:border-b-0"
                                              onClick={() =>
                                                setSelectedOffer({
                                                  contractId: contract.id,
                                                  offer,
                                                })
                                              }
                                            >
                                              <td className="px-4 py-2">
                                                {offer.offerName}
                                              </td>
                                              <td className="px-4 py-2">
                                                {offer.supplierAdvancePercentage !=
                                                null
                                                  ? `${offer.supplierAdvancePercentage}%`
                                                  : "-"}
                                              </td>
                                              <td className="px-4 py-2">
                                                {offer.financingDateOffsetDays !=
                                                null
                                                  ? `${offer.financingDateOffsetDays} Days`
                                                  : "-"}
                                              </td>
                                              <td className="px-4 py-2">
                                                {offer.repaymentPeriod != null
                                                  ? `${offer.repaymentPeriod} Days`
                                                  : "-"}
                                              </td>
                                              <td className="px-4 py-2">
                                                {offer.installmentNumber ?? "-"}
                                              </td>
                                              <td className="px-4 py-2">
                                                {`${((offer.financierShare ?? 0) + (offer.insurerShare ?? 0) + (offer.collectorShare ?? 0) + (offer.bwadlShare ?? 0)).toFixed(2)}%`}
                                              </td>
                                              <td className="px-4 py-2">
                                                {offer.financierShare != null
                                                  ? `${offer.financierShare}%`
                                                  : "-"}
                                              </td>
                                              <td className="px-4 py-2">
                                                {offer.insurerShare != null
                                                  ? `${offer.insurerShare}%`
                                                  : "-"}
                                              </td>
                                              <td className="px-4 py-2">
                                                {offer.collectorShare != null
                                                  ? `${offer.collectorShare}%`
                                                  : "-"}
                                              </td>
                                              <td className="px-4 py-2">
                                                {offer.bwadlShare != null
                                                  ? `${offer.bwadlShare}%`
                                                  : "-"}
                                              </td>
                                              <td className="px-4 py-2">
                                                {" "}
                                                <DeleteContractOfferPopUp
                                                  offerId={offer.id}
                                                />{" "}
                                              </td>
                                            </tr>
                                          ))}
                                          {offers.length === 0 && (
                                            <tr>
                                              <td
                                                colSpan={11}
                                                className="px-4 py-4 text-center text-sm text-gray-400"
                                              >
                                                No offers
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedOffer && (
                  <EditFinancierOfferPopUp
                    contractId={selectedOffer.contractId}
                    offer={selectedOffer.offer}
                    open
                    onOpenChange={(open) => {
                      if (!open) setSelectedOffer(null);
                    }}
                  />
                )}
              </div>
            )}

            {/* Invoice List Tab */}
            {activeTab === "invoices" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-end justify-between">
                  <label className="font-bold">
                    {t("admin.suppliers.invoice-list")}
                  </label>
                  {/* 	<button
										className="text-sm font-medium text-primary underline"
										type="button"
										onClick={() => router.push(`${config.PATHS.dashboard.ADMIN.invoices}=${id}`)}
									>
										{t("admin.suppliers.view-all")}
									</button> */}
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
                        render: (_, row) => row.buyer?.buyerName ?? "-",
                      },
                      /* {
												alignment: "right",
												key: "invoiceAmount",
												label: <RiyalTitle>{t("admin.suppliers.invoice-amount")}</RiyalTitle>,
												render: value => <FormattedNumber value={value} />,
											}, */
                      {
                        alignment: "left",
                        key: "deliveryAmount",
                        label: (
                          <RiyalTitle>
                            {t("admin.suppliers.delivery-amount")}
                          </RiyalTitle>
                        ),
                        sortable: true,
                        render: (value) => <FormattedNumber value={value} />,
                      },
                      {
                        key: "deliveryDate",
                        label: t("admin.invoices.delivery-date"),
                        sortable: true,
                        render: (value) => dayjs(value).format("DD/MM/YYYY"),
                      },
                      /* {
												label: t("admin.suppliers.delay-in-delivery"),
												render: (_, row) => {
													const deliveryDate = row.deliveryDate;
													const orderDate = row.orderDate;
													if (!deliveryDate) return "-";
													const days = dayjs(deliveryDate).diff(dayjs(orderDate), "days");
													return days > 0 ? days : "-";
												},
											}, */
                      {
                        key: "status",
                        label: t("admin.suppliers.delivery-status"),
                        sortable: true,
                        render: (_, row) => (
                          <InvoiceStatusPill status={row.status} />
                        ),
                      },
                    ]}
                    loading={isLoadingInvoices}
                    sortKey={iSortBy}
                    sortOrder={iSortOrder}
                    onSortBy={(key, dir) =>
                      setParams({ iPage: null, iSortBy: key || "", iSortOrder: dir })
                    }
                    onClick={(row) =>
                      router.push(
                        `${config.PATHS.dashboard.ADMIN.invoice(row.id, row.buyer?.id)}?fromSupplierId=${id}`,
                      )
                    }
                  />
                </div>

                <Pagination
                  currentCount={pagedInvoices.length}
                  page={iPage}
                  perPage={iPageSize}
                  setPage={(iPage) => setParams({ iPage })}
                  setPerPage={(iPageSize) =>
                    setParams({ iPage: null, iPageSize })
                  }
                  totalCount={invoicesData?.totalCount || 0}
                  showing
                />
              </div>
            )}
          </div>
        )}
      </DataLoading>

      <EditInvoicePopup
        invoice={editInvoice}
        open={!!editInvoice}
        onOpenChange={(open) => {
          if (!open) setEditInvoice(null);
        }}
      />

      {deleteInvoiceId && (
        <DeleteInvoicePopUp
          invoiceId={deleteInvoiceId}
          open
          onOpenChange={(open) => {
            if (!open) setDeleteInvoiceId(null);
          }}
        />
      )}
    </>
  );
}