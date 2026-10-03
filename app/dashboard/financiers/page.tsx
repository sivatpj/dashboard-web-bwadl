"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { DeleteFinancierPopUp } from "@/components/entities/admin/financiers/delete-financier-pop-up";
import { FinancierHeader } from "@/components/entities/admin/financiers/financier-header";
import { FormattedNumber } from "@/components/global/formatted-number";
import { HighlightText } from "@/components/global/highlight-text";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

export default function Page(props: PageProps<"/dashboard/financiers">) {
	const router = useRouter();
	const params = useSearchParams();
	const setParams = useSetParams();

	const { t } = useTranslationContext();

	const [deleteFinancierId, setDeleteFinancierId] = useState<number | null>(null);

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const q = params.get("search") || "";

	const { data: financiersData, isPending: isFinanciersLoading } = useFetchFinanciers({
		limit: pageSize,
		page,
		q,
	});

	const sortedFinanciers = financiersData?.financiers ? [...financiersData.financiers].sort((a, b) => b.id - a.id) : financiersData?.financiers;

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.financiers.list-of-financiers"),
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<FinancierHeader />

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={sortedFinanciers}
						headers={[
							{ key: "crNumber", label: t("admin.financiers.cr-number"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
							{ key: "facilityName", label: t("admin.financiers.facility-name"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
							{
								key: "financierName",
								label: t("admin.financiers.financier-name"),
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							{
								alignment: "right",
								key: "limit",
								label: <RiyalTitle>{t("admin.financiers.credit-limit")}</RiyalTitle>,
								render: value => <FormattedNumber value={value} />,
							},
							{
								alignment: "right",
								key: "calcAvailableLimit",
								label: <RiyalTitle>{t("admin.financiers.available-limit")}</RiyalTitle>,
								render: value => <FormattedNumber value={value} />,
							},
							{
								alignment: "right",
								label: <RiyalTitle>{t("admin.financiers.consumed-limit")}</RiyalTitle>,
								render: (_: unknown, row) => (
									<div className="flex justify-end" data-ignore-row>
										<FormattedNumber value={row.limit - row.calcAvailableLimit} />
									</div>
								),
							},
							
							{
								label: t("admin.financiers.email"),
								render: (_: unknown, row) => row.additionalInfo?.email,
							},
						]}
						loading={isFinanciersLoading}
						onClick={row => router.push(config.PATHS.dashboard.ADMIN.financier(row.id))}
						onOpen={row => router.push(config.PATHS.dashboard.ADMIN.financier(row.id))}
						onEdit={row => router.push(config.PATHS.dashboard.ADMIN.editFinancier(row.id))}
						onDelete={row => setDeleteFinancierId(row.id)}
					/>
				</div>

				{deleteFinancierId && (
					<DeleteFinancierPopUp
						financierId={deleteFinancierId}
						open
						onOpenChange={open => {
							if (!open) setDeleteFinancierId(null);
						}}
					/>
				)}

				<Pagination
					currentCount={financiersData?.financiers.length}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={financiersData?.totalCount || 0}
					showing
					setPerPage={pageSize => setParams({ page: null, pageSize })}
				/>
			</div>
		</>
	);
}
