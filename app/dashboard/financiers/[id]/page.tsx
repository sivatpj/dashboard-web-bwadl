"use client";

import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";
import { use, useState } from "react";
import { useFetchFinancier } from "@/api/endpoints/back-office/financiers/fetch-financier";
import { useFetchInvoices } from "@/api/endpoints/back-office/invoices/fetch-invoices";
import { useFetchSalesOrders } from "@/api/endpoints/back-office/sales-orders/fetch-sales-orders";
import { IFinancierOffer } from "@/api/types";
import { AddNewOfferPopup } from "@/components/entities/admin/financiers/add-new-offer-popup";
import { DeleteContractOfferPopUp } from "@/components/entities/admin/financiers/delete-contract-offer-pop-up";
import { EditFinancierOfferPopUp } from "@/components/entities/admin/financiers/edit-financier-offer-pop-up";
import { EditContract } from "@/components/entities/admin/dashboard/suppliers/edit-contract";
import { DeleteContractPopUp } from "@/components/entities/admin/dashboard/suppliers/delete-contract-popup";
import { FinancierInformation } from "@/components/entities/admin/financiers/financier-information";
import { ParticipantDefaults } from "@/components/entities/admin/participant-defaults";
import { DataLoading } from "@/components/global/data-loading";
import { Icon } from "@/components/global/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { cn } from "@/lib/utils";

export default function Page(props: PageProps<"/dashboard/financiers/[id]">) {
  const { id } = use(props.params);

  const { t } = useTranslationContext();

  const [activeTab, setActiveTab] = useState("details");
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(
    new Set(),
  );
  const [selectedOffer, setSelectedOffer] = useState<{
    contractId: number;
    offer: IFinancierOffer;
  } | null>(null);
  const [editOffer, setEditOffer] = useState<{
    contractId: number;
    offer: IFinancierOffer;
  } | null>(null);

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

  const { data, isLoading } = useFetchFinancier({
    id,
  });

  const { data: invoicesData } = useFetchInvoices(
    {
      financierId: id,
      limit: 10000,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    { enabled: Boolean(data?.financier) },
  );

  const { data: salesOrdersData } = useFetchSalesOrders(
    {
      financierId: +id,
      limit: 10000,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    { enabled: Boolean(data?.financier) },
  );

  const contracts =
    data?.financier.financierSupplierContracts.map((contract) => ({
      ...contract,
      supplierName: contract.supplier?.supplierName ?? "-",
    })) ?? [];
  const financierOfferIds = new Set(
    data?.financier.financierSupplierContracts.flatMap((contract) =>
      contract.financierOffers.map((offer) => offer.id),
    ) ?? [],
  );
  const latestInvoice = (invoicesData?.invoices || [])
    .filter(
      (invoice) =>
        (invoice as any).financierId === +id ||
        financierOfferIds.has(invoice.financierOfferId),
    )
    .sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
    )[0];

  const latestSalesOrderDate = (salesOrdersData?.salesOrders || [])
    .filter((order) => financierOfferIds.has(order.offerId))
    .sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
    )[0]?.createdAt;

  return (
    <>
      <BreadcrumbTitles
        crumbs={[
          { position: 0, title: t("admin.financiers.list-of-financiers") },
          { position: 1, title: data?.financier.financierName },
        ]}
        isLoading={isLoading}
      />

      <DataLoading isLoading={isLoading} data={data?.financier}>
        {(financier) => (
          <div className="flex h-full flex-col gap-4 px-4 py-4">
            <FinancierInformation
              financier={financier}
              activeTab={activeTab}
              latestInvoice={latestInvoice}
              latestSalesOrderDate={latestSalesOrderDate}
              onTabChange={setActiveTab}
            />

            {activeTab === "contracts" && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-end">
                  <AddNewOfferPopup
                    contracts={financier.financierSupplierContracts}
                    financierId={+id}
                  />
                </div>

                <div className="flex overflow-hidden rounded-xl border border-gray-100">
                  <div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
                  <div className="flex-1">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
                          <th className="px-4 py-3">
                            {t("admin.financiers.contract-name")}
                          </th>
                          <th className="px-4 py-3">
                            {t("admin.suppliers.supplier-name")}
                          </th>
                          <th className="px-4 py-3">
                            {t("admin.financiers.contract-start-date")}
                          </th>
                          <th className="py-3 pr-4">
                            <div className="flex items-center gap-1">
                              <span className="flex items-center gap-0.5 text-xs">
                                (<Icon className="w-3" name="Riyal" />)
                              </span>
                              {t("admin.financiers.advance-limit")}
                            </div>
                          </th>
                          <th className="py-3 pr-4">
                            <div className="flex items-center gap-1">
                              <span className="flex items-center gap-0.5 text-xs">
                                (<Icon className="w-3" name="Riyal" />)
                              </span>
                              {t("admin.financiers.available-advance")}
                            </div>
                          </th>
                          <th className="py-3 pr-4">
                            <div className="flex items-center gap-1">
                              <span className="flex items-center gap-0.5 text-xs">
                                (<Icon className="w-3" name="Riyal" />)
                              </span>
                              {t("admin.suppliers.consumed-limit")}
                            </div>
                          </th>
                          {/* <th className="px-4 py-3">{t("admin.financiers.start-date")}</th>
													<th className="px-4 py-3">{t("admin.financiers.package")}</th> */}
                          <th className="px-4 py-3" />
                          <th className="w-10 px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {contracts.map((contract) => {
                          const isExpanded = expandedContracts.has(contract.id);
                          const offers =
                            ((contract as any)
                              .financierOffers as IFinancierOffer[]) ?? [];
                          return (
                            <>
                              <tr
                                key={`contract-${contract.id}`}
                                className="cursor-pointer border-b bg-white text-sm hover:bg-gray-50"
                                onClick={() => toggleContract(contract.id)}
                              >
                                <td className="px-4 py-3">{contract.name}</td>
                                <td className="px-4 py-3">
                                  {contract.supplierName}
                                </td>
                                <td className="px-4 py-3">
                                  {contract.additionalInfo?.contractStartDate
                                    ? dayjs(
                                        contract.additionalInfo
                                          .contractStartDate,
                                      ).format("DD MMM, YYYY")
                                    : "-"}
                                </td>
                                <td className="px-4 py-3">
                                  {contract.advanceCap != null
                                    ? Number(contract.advanceCap).toFixed(2)
                                    : "-"}
                                </td>
                                <td className="px-4 py-3">
                                  {contract.availableAdvance != null
                                    ? Number(contract.availableAdvance).toFixed(
                                        2,
                                      )
                                    : "-"}
                                </td>
                                <td className="px-4 py-3">
                                  {contract.advanceCap != null &&
                                  contract.availableAdvance != null
                                    ? Number(
                                        contract.advanceCap -
                                          contract.availableAdvance,
                                      ).toFixed(2)
                                    : "-"}
                                </td>
                                {/* <td className="px-4 py-3">
																	{contract.createdAt ? dayjs(contract.createdAt).format("DD MMM, YYYY") : "-"}
																</td>
																<td className="px-4 py-3">{contract.additionalInfo?.package ?? "-"}</td> */}
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
                                    colSpan={9}
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
                                                <DeleteContractOfferPopUp
                                                  offerId={offer.id}
                                                />
                                              </td>
                                            </tr>
                                          ))}
                                          {offers.length === 0 && (
                                            <tr>
                                              <td
                                                colSpan={12}
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
              </div>
            )}

            {activeTab === "more" && (
              <ParticipantDefaults id={+id} type="financier" />
            )}

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

            {editOffer && (
              <EditFinancierOfferPopUp
                contractId={editOffer.contractId}
                offer={editOffer.offer}
                open
                onOpenChange={(open) => {
                  if (!open) setEditOffer(null);
                }}
              />
            )}
          </div>
        )}
      </DataLoading>
    </>
  );
}
