"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFetchInsurers } from "@/api/endpoints/back-office/insurers/fetch-insurers";
import { DeleteInsurerPopUp } from "@/components/entities/admin/insurers/delete-insurer-pop-up";
import { InsurerHeader } from "@/components/entities/admin/insurers/insurer-header";
import { HighlightText } from "@/components/global/highlight-text";
import { Pagination } from "@/components/global/pagination";
import { DataTable } from "@/components/ui/data-table";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

export default function Page(props: PageProps<"/dashboard/insurers">) {
	const router = useRouter();
	const params = useSearchParams();
	const setParams = useSetParams();

	const { t } = useTranslationContext();
	const [deleteInsurerId, setDeleteInsurerId] = useState<number | null>(null);

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const q = params.get("search") || "";

	const { data: insurersData, isPending: isInsurersLoading } = useFetchInsurers({
		limit: pageSize,
		page,
		q,
	});

	const sortedInsurers = insurersData?.insurers ? [...insurersData.insurers].sort((a, b) => b.id - a.id) : insurersData?.insurers;

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.insurers.list-of-insurers"),
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<InsurerHeader />

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={sortedInsurers || []}
						headers={[
							{ key: "crNumber", label: t("admin.insurers.cr-number"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
							{ key: "facilityName", label: t("admin.insurers.facility-name"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
							{ key: "insurerName", label: t("admin.insurers.insurer-name"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
							{
								key: "additionalInfo",
								label: t("admin.insurers.financial-share"),
								render: value => value?.financialShare ?? "-",
							},
							{
								key: "additionalInfo",
								label: t("admin.insurers.accounting-fees"),
								render: value => value?.accountingFees ?? "-",
							},
							{
								key: "additionalInfo",
								label: t("admin.insurers.accounting-cancellation-fees"),
								render: value => (value?.accountingCancellationFees ? `${value.accountingCancellationFees}%` : "-"),
							},
						]}
						loading={isInsurersLoading}
						onClick={row => router.push(config.PATHS.dashboard.ADMIN.insurer(row.id))}
						onOpen={row => router.push(config.PATHS.dashboard.ADMIN.insurer(row.id))}
						onEdit={row => router.push(config.PATHS.dashboard.ADMIN.insurer(row.id))}
						onDelete={row => setDeleteInsurerId(row.id)}
					/>
				</div>

				{deleteInsurerId && (
					<DeleteInsurerPopUp
						insurerId={deleteInsurerId}
						open
						onOpenChange={open => {
							if (!open) setDeleteInsurerId(null);
						}}
					/>
				)}

				<Pagination
					currentCount={insurersData?.insurers.length}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={insurersData?.totalCount || 0}
					showing
					setPerPage={pageSize => setParams({ page: null, pageSize })}
				/>
			</div>
		</>
	);
}
