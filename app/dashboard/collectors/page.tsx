"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFetchCollectors } from "@/api/endpoints/back-office/collectors/fetch-collectors";
import { CollectorHeader } from "@/components/entities/admin/collectors/collector-header";
import { DeleteCollectorPopUp } from "@/components/entities/admin/collectors/delete-collector-pop-up";
import { HighlightText } from "@/components/global/highlight-text";
import { Pagination } from "@/components/global/pagination";
import { DataTable } from "@/components/ui/data-table";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

export default function Page(props: PageProps<"/dashboard/collectors">) {
	const params = useSearchParams();
	const setParams = useSetParams();
	const router = useRouter();

	const { t } = useTranslationContext();
	const [deleteCollectorId, setDeleteCollectorId] = useState<number | null>(null);

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const q = params.get("search") || "";

	const { data: collectorsData, isPending: isCollectorsLoading } = useFetchCollectors({
		limit: pageSize,
		page,
		q,
	});

	const sortedCollectors = collectorsData?.collectors ? [...collectorsData.collectors].sort((a, b) => b.id - a.id) : collectorsData?.collectors;

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.collectors.list-of-collectors"),
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<CollectorHeader />

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={sortedCollectors}
						headers={[
							{ key: "crNumber", label: t("admin.collectors.cr-number"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
							{ key: "facilityName", label: t("admin.collectors.facility-name"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
							{
								key: "collectorName",
								label: t("admin.collectors.collector-name"),
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							/* {
								key: "additionalInfo",
								label: t("admin.collectors.financial-share"),
								render: (value: any) => value?.financialShare ?? "-",
							}, */
							{
								key: "additionalInfo",
								label: t("admin.collectors.accounting-fees"),
								render: (value: any) => value?.accountingFees ?? "-",
							},
							{
								key: "additionalInfo",
								label: t("admin.collectors.accounting-cancellation-fees"),
								render: (value: any) =>
									value?.accountingCancellationFees != null ? `${value.accountingCancellationFees}%` : "-",
							},
						]}
						loading={isCollectorsLoading}
						onClick={row => router.push(config.PATHS.dashboard.ADMIN.collector(row.id))}
						onOpen={row => router.push(config.PATHS.dashboard.ADMIN.collector(row.id))}
						onEdit={row => router.push(config.PATHS.dashboard.ADMIN.collector(row.id))}
						onDelete={row => setDeleteCollectorId(row.id)}
					/>
				</div>

				{deleteCollectorId && (
					<DeleteCollectorPopUp
						collectorId={deleteCollectorId}
						open
						onOpenChange={open => {
							if (!open) setDeleteCollectorId(null);
						}}
					/>
				)}

				<Pagination
					currentCount={collectorsData?.collectors.length}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={collectorsData?.totalCount || 0}
					setPerPage={pageSize => setParams({ page: null, pageSize })}
					showing
				/>
			</div>
		</>
	);
}
