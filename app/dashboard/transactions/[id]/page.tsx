"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { useFetchTransactionById } from "@/api/endpoints/back-office/transactions/fetch-transactions";
import { TransactionInformation } from "@/components/entities/admin/dashboard/transactions/transaction-information";
import { DataLoading } from "@/components/global/data-loading";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { config } from "@/constants/config";

export default function Page(props: PageProps<"/dashboard/transactions/[id]">) {
	const { id } = use(props.params);

	const { t } = useTranslationContext();
	const searchParams = useSearchParams();

	const from = searchParams.get("from");
	const buyerId = searchParams.get("buyerId");
	const invoiceId = searchParams.get("invoiceId");
	const salesOrderId = searchParams.get("salesOrderId");
	const salesOrderRef = searchParams.get("salesOrderRef");
	const actionDate = searchParams.get("actionDate") ?? undefined;

	const { data, isLoading } = useFetchTransactionById(Number(id), actionDate);

	const journalEntry = data?.journalEntry
		? { ...data.journalEntry, deliveryAmount: data.deliveryAmount, invoiceAmount: data.invoiceAmount }
		: undefined;

	const buildCrumbs = () => {
		if (from === "sales-order" && buyerId && salesOrderId) {
			return [
				{
					href: `${config.PATHS.dashboard.ADMIN.salesOrder(Number(salesOrderId), Number(buyerId))}?tab=action`,
					position: 0,
					title: salesOrderRef || t("admin.sales-orders.sales-order-details"),
				},
				{
					position: 1,
					title: data?.journalEntry.referenceNumber,
				},
			];
		}

		if (from === "invoice" && buyerId && invoiceId) {
			const invoiceHref = salesOrderId
				? `${config.PATHS.dashboard.ADMIN.invoice(Number(invoiceId), Number(buyerId))}?salesOrderId=${salesOrderId}&salesOrderRef=${encodeURIComponent(salesOrderRef || "")}&tab=action`
				: `${config.PATHS.dashboard.ADMIN.invoice(Number(invoiceId), Number(buyerId))}?tab=action`;

			return [
				{
					href: invoiceHref,
					position: 0,
					title: salesOrderRef || t("admin.invoices.invoice-details"),
				},
				{
					position: 1,
					title: data?.journalEntry.referenceNumber,
				},
			];
		}

		return [
			{
				position: 0,
				title: t("admin.transactions.transactions"),
			},
			{
				position: 1,
				title: data?.journalEntry.referenceNumber,
			},
		];
	};

	return (
		<>
			<BreadcrumbTitles
				crumbs={buildCrumbs()}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={journalEntry}>
				{entry => (
					<div className="flex h-full flex-col gap-4 px-4 py-4">
						<TransactionInformation {...entry} />
					</div>
				)}
			</DataLoading>
		</>
	);
}
