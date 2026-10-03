"use client";

import dayjs from "dayjs";
import { useState } from "react";
import { useFetchEscalationReport } from "@/api/endpoints/back-office/collection-advice/fetch-escalation-report";
import { Pagination } from "@/components/global/pagination";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormattedNumber } from "@/components/global/formatted-number";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";

const PAGE_SIZE = 10;

export default function Page(props: PageProps<"/dashboard/file-upload/escalation-report">) {
	const { t } = useTranslationContext();

	const [eligibleAt, setEligibleAt] = useState<string>("");
	const [reports, setReports] = useState<any[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [hasLoaded, setHasLoaded] = useState(false);
	const [page, setPage] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(
		Number(localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || PAGE_SIZE),
	);

	const { mutate: fetchReport, isPending: isLoading } = useFetchEscalationReport({
		onSuccess: response => {
			setReports(response.reports);
			setTotalCount(response.totalCount ?? 0);
			setHasLoaded(true);
		},
	});

	const handleFetch = (p = 1, limit = pageSize) => {
		const body: { eligible_at?: string; page: number; limit: number } = { page: p, limit };
		if (eligibleAt) body.eligible_at = eligibleAt;
		fetchReport(body);
	};

	const handlePageChange = (p: number) => {
		setPage(p);
		handleFetch(p, pageSize);
	};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setPage(1);
		handleFetch(1, size);
	};

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 1,
						title: t("admin.collection-advice.escalation-report"),
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<div className="flex flex-wrap items-end gap-4 rounded-[5px] border border-input bg-white p-4 shadow-sm">
					<div className="flex flex-col gap-1">
						<label className="text-sm text-[#404040]">{t("admin.collection-advice.eligible-at")}</label>
						<Input
							className="w-52"
							placeholder={t("admin.collection-advice.eligible-at-placeholder")}
							type="date"
							value={eligibleAt}
							onChange={e => setEligibleAt(e.target.value)}
						/>
					</div>

					<Button loading={isLoading} size="default" onClick={() => { setPage(1); handleFetch(1, pageSize); }}>
						{t("admin.collection-advice.apply-filter")}
					</Button>
				</div>

				<p className="text-base font-semibold text-[#404040]">{t("admin.collection-advice.escalation-report-list")}</p>

				<DataTable
					className="flex-1"
					data={hasLoaded ? reports : undefined}
					headers={[
						{
							key: "id",
							label: "#",
						},
						{
							key: "invoice_id",
							label: t("admin.collection-advice.invoice-id"),
						},
						{
							key: "order_reference",
							label: t("admin.collection-advice.order-reference"),
						},
						{
							key: "amount",
							label: t("admin.collection-advice.amount"),
							render: value => <FormattedNumber value={value} />,
						},
						{

							key: "remaining_amount",
							label: t("admin.collection-advice.remaining-amount"),
							render: value => <FormattedNumber value={value} />,
						},
						{

							key: "applied_amount",
							label: t("admin.collection-advice.applied-amount"),
							render: value => <FormattedNumber value={value} />,
						},
						{
							key: "eligible_at",
							label: t("admin.collection-advice.eligible-at"),
							render: value => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
						},
						{
							key: "created_at",
							label: t("admin.collection-advice.created-at"),
							render: value => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"),
						},

						{
							key: "status",
							label: t("admin.collection-advice.status"),
							render: value => (
								<span
									className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
										value === "Reconciled"
											? "bg-green-100 text-green-700"
											: value === "New"
												? "bg-blue-100 text-blue-700"
												: "bg-gray-100 text-gray-600"
									}`}
								>
									{value || "-"}
								</span>
							),
						},

					]}
					loading={isLoading}
				/>

				{hasLoaded && (
					<Pagination
						currentCount={reports.length}
						page={page}
						perPage={pageSize}
						setPage={handlePageChange}
						totalCount={totalCount}
						showing
						setPerPage={handlePageSizeChange}
					/>
				)}
			</div>
		</>
	);
}
