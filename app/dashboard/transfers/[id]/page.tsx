"use client";

import { use } from "react";
import { useFetchTransferById } from "@/api/endpoints/back-office/transfers/fetch-transfers";
import { useFetchTransactionById } from "@/api/endpoints/back-office/transactions/fetch-transactions";
import { TransactionInformation } from "@/components/entities/admin/dashboard/transactions/transaction-information";
import { DataLoading } from "@/components/global/data-loading";
import { FormattedNumber } from "@/components/global/formatted-number";
import { RiyalTitle } from "@/components/global/riyal-title";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import dayjs from "dayjs";

export default function Page(props: PageProps<"/dashboard/transfers/[id]">) {
	const { id } = use(props.params);
	const { t } = useTranslationContext();

	const { data: transferData, isLoading: isTransferLoading } = useFetchTransferById(Number(id));
	const journalEntryId = transferData?.transfer?.journalEntryId;

	const { data: journalData, isLoading: isJournalLoading } = useFetchTransactionById(
		journalEntryId ?? undefined,
		undefined,
		{ enabled: Boolean(journalEntryId) },
	);

	const isLoading = isTransferLoading || isJournalLoading;

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						href: "/dashboard/transfers",
						position: 0,
						title: t("admin.transfers.transfers"),
					},
					{
						position: 1,
						title: transferData?.transfer?.transferType ?? null,
					},
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isTransferLoading} data={transferData?.transfer}>
				{transfer => (
					<div className="flex h-full flex-col gap-4 px-4 py-4">
						{/* Transfer summary card */}
						<div className="flex flex-wrap gap-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
							<div className="flex flex-col gap-1">
								<span className="text-xs text-gray-500">{t("admin.transfers.type")}</span>
								<span className="font-semibold">{transfer.transferType}</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-xs text-gray-500">{t("admin.transfers.date")}</span>
								<span className="font-semibold">
									{transfer.createdAt ? dayjs(transfer.createdAt).format("DD/MM/YYYY HH:mm") : "-"}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-xs text-gray-500">{t("admin.transfers.note")}</span>
								<span className="font-semibold">{transfer.transferNote ?? "-"}</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-xs text-gray-500">
									<RiyalTitle>{t("admin.transfers.amount")}</RiyalTitle>
								</span>
								<span className="font-semibold">
									<FormattedNumber value={Number(transfer.amount)} />
								</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-xs text-gray-500">{t("admin.transfers.journal-entry")}</span>
								<span className="font-semibold">
									{transfer.journalEntryId ? `#${transfer.journalEntryId}` : "-"}
								</span>
							</div>
						</div>

						{/* Journal entry lines */}
						{journalEntryId && (
							<DataLoading isLoading={isJournalLoading} data={journalData?.journalEntry}>
								{entry => (
									<TransactionInformation
										{...entry}
										deliveryAmount={journalData?.deliveryAmount}
										invoiceAmount={journalData?.invoiceAmount}
									/>
								)}
							</DataLoading>
						)}

						{!journalEntryId && (
							<div className="flex items-center justify-center rounded-xl border border-gray-100 bg-white p-8 text-sm text-gray-400">
								{t("admin.transfers.journal-entry")} — pending
							</div>
						)}
					</div>
				)}
			</DataLoading>
		</>
	);
}
