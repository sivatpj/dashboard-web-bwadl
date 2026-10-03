"use client";

import dayjs from "dayjs";
import { use } from "react";
import { useFetchJournalEntryLines } from "@/api/endpoints/back-office/collection-advice/fetch-journal-entries";
import { useFetchCollectionsByJournal } from "@/api/endpoints/back-office/collections/fetch-collections-by-journal";
import { DataLoading } from "@/components/global/data-loading";
import { DataTable } from "@/components/ui/data-table";
import { FormattedNumber } from "@/components/global/formatted-number";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";

export default function Page(
	props: PageProps<"/dashboard/file-upload/upload-list/[batchId]/journal-entry/[journalEntryId]">,
) {
	const { batchId, journalEntryId } = use(props.params);
	const { t } = useTranslationContext();

	const { data, isLoading } = useFetchJournalEntryLines(Number(journalEntryId));
	const { data: collectionsData, isLoading: isCollectionsLoading } = useFetchCollectionsByJournal(Number(journalEntryId));

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 1,
						title: t("admin.collection-advice.upload-list"),
						href: config.PATHS.dashboard.ADMIN.fileUploadList,
					},
					{
						position: 2,
						title: batchId,
						href: config.PATHS.dashboard.ADMIN.fileUploadListDetail(batchId),
					},
					{
						position: 3,
						title: null,
					},
					{
						position: 4,
						title: t("admin.collection-advice.journal-entry-lines"),
					},
				]}
				isLoading={isLoading}
			/>

			<div className="flex h-full flex-col gap-6 px-4 py-4">
				<DataLoading isLoading={isLoading} data={data?.lines}>
					{lines => (
						<div className="flex flex-col gap-4">
							<p className="text-base font-semibold text-[#404040]">
								{t("admin.collection-advice.journal-entry-lines")}
							</p>

							<DataTable
								className="flex-1"
								data={lines}
								headers={[
									{
										key: "lineNumber",
										label: t("admin.collection-advice.line-number"),
									},
									{
										key: "accountId",
										label: t("admin.collection-advice.account-id"),
									},
									{
										key: "description",
										label: t("admin.collection-advice.description"),
									},
									{
										key: "debitAmount",
										label: t("admin.collection-advice.debit-amount"),
										render: value => <FormattedNumber value={value} />,
									},
									{
										key: "creditAmount",
										label: t("admin.collection-advice.credit-amount"),
										render: value => <FormattedNumber value={value} />,
									},
									{
										key: "createdAt",
										label: t("admin.collection-advice.created-at"),
										render: value => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"),
									},
									{
										key: "updatedAt",
										label: t("admin.collection-advice.updated-at"),
										render: value => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"),
									},
								]}
							/>
						</div>
					)}
				</DataLoading>

				<div className="flex flex-col gap-4">
					<p className="text-base font-semibold text-[#404040]">
						{t("admin.collection-advice.collections")}
					</p>

					<DataTable
						data={collectionsData?.collections}
						loading={isCollectionsLoading}
						headers={[
							{
								key: "invoiceReference",
								label: t("admin.collection-advice.reference"),
							},
							{
								key: "merchantName",
								label: t("admin.collection-advice.merchant-name"),
							},
							{
								key: "amount",
								label: t("admin.collection-advice.amount"),
								render: value => <FormattedNumber value={value} />,
							},
							{
								key: "remainingAmount",
								label: t("admin.collection-advice.remaining-amount"),
								render: value => <FormattedNumber value={value} />,
							},
							/* {
								key: "appliedAmount",
								label: t("admin.collection-advice.applied-amount"),
								render: value => <FormattedNumber value={value} />,
							}, */
							{
								key: "lastAppliedAmount",
								label: t("admin.collection-advice.applied-amount"),
								render: value => <FormattedNumber value={value} />,
							},
							{
								key: "status",
								label: t("admin.collection-advice.status"),
							},
							{
								key: "eligibleAt",
								label: t("admin.collection-advice.eligible-at"),
								render: value => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
							},
							{
								key: "appliedAt",
								label: t("admin.collection-advice.applied-at"),
								render: value => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
							},
							{
								key: "createdAt",
								label: t("admin.collection-advice.created-at"),
								render: value => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"),
							},
						]}
					/>
				</div>
			</div>
		</>
	);
}
