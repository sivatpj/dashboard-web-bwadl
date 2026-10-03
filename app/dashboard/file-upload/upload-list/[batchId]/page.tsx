"use client";

import dayjs from "dayjs";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFetchFileData } from "@/api/endpoints/back-office/collection-advice/fetch-file-data";
import { useFetchFileHeaders } from "@/api/endpoints/back-office/collection-advice/fetch-file-headers";
import { useFileProcess } from "@/api/endpoints/back-office/collection-advice/file-process.api";
import { PaymentTransactionPanel } from "@/components/entities/admin/dashboard/collections/payment-transaction-panel";
import { Pagination } from "@/components/global/pagination";
import { ProgressModal, type ProgressStep } from "@/components/global/progress-modal";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { FormattedNumber } from "@/components/global/formatted-number";
import { useSetParams } from "@/hooks/use-set-params";

const PROCESS_STATUSES = ["New", "Not Found", "Ignored", "Error", "Reconciled"];

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-xs text-gray-500">{label}</span>
			<span className="text-sm text-[#404040]">
				{value !== null && value !== undefined && value !== "" ? value : "-"}
			</span>
		</div>
	);
}

function ProcessStatusBadge({ value }: { value: string | null | undefined }) {
	return (
		<span
			className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
				value === "Reconciled"
					? "bg-green-100 text-green-700"
					: value === "Not Found"
						? "bg-red-100 text-red-700"
						: value === "Ignored"
							? "bg-yellow-100 text-yellow-700"
							: value === "Error"
								? "bg-orange-100 text-orange-700"
								: "bg-gray-100 text-gray-600"
			}`}
		>
			{value || "-"}
		</span>
	);
}

export default function Page(props: PageProps<"/dashboard/file-upload/upload-list/[batchId]">) {
	const { batchId } = use(props.params);
	const { t } = useTranslationContext();
	const params = useSearchParams();
	const setParams = useSetParams();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const [processStatus, setProcessStatus] = useState<string>("all");
	const [orderReference, setOrderReference] = useState<string>("");
	const [fileData, setFileData] = useState<any[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [selectedRow, setSelectedRow] = useState<any | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const [progressStep, setProgressStep] = useState<ProgressStep | null>(null);
	const [errorMessage, setErrorMessage] = useState<string>("");

	const { data: headerData } = useFetchFileHeaders({ batch_id: batchId, limit: 1 });
	const batchStatus = headerData?.headers?.[0]?.status;
	const isNewBatch = batchStatus === "New";

	const { mutate: fetchFileData } = useFetchFileData({
		onSuccess: response => {
			setFileData(response.data ?? []);
			setTotalCount(response.totalCount ?? 0);
			setIsLoadingData(false);
		},
		onError: () => setIsLoadingData(false),
	});

	const { mutate: processFile, isPending: isProcessing } = useFileProcess({
		onSuccess: () => {
			setProgressStep("done");
			loadFileData(processStatus, page, pageSize);
		},
		onError: (err: any) => {
			setErrorMessage(err?.response?.data?.message || err?.message || "Processing failed. Please try again.");
			setProgressStep("error");
		},
	});

	const loadFileData = (status: string, p: number, limit: number, search?: string) => {
		setIsLoadingData(true);
		const body: { batch_id: string; process_status?: string; order_reference?: string; page: number; limit: number } = {
			batch_id: batchId,
			page: p,
			limit,
		};
		if (status !== "all") body.process_status = status;
		if (search) body.order_reference = search;
		fetchFileData(body);
	};

	useEffect(() => {
		loadFileData(processStatus, page, pageSize, orderReference);
	}, [batchId, page, pageSize]);

	const handleSearch = () => {
		setParams({ page: 1 });
		loadFileData(processStatus, 1, pageSize, orderReference);
	};

	const handleStatusChange = (value: string) => {
		setProcessStatus(value);
		setParams({ page: 1 });
		loadFileData(value, 1, pageSize, orderReference);
	};

	const hasNotFound = fileData.some(d => d.process_status === "Not Found");

	const handleReprocess = () => {
		setErrorMessage("");
		setProgressStep("processing");
		processFile({ batch_id: batchId, reprocess: !isNewBatch });
	};

	const handleCloseProgress = () => {
		setProgressStep(null);
		setErrorMessage("");
	};

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
					},
				]}
			/>

			{progressStep && (
				<ProgressModal
					errorMessage={errorMessage}
					labels={{
						processing: "Reprocessing records",
						processingDescription: "Reprocessing and reconciling records…",
						done: "Reprocess Complete",
						failedTitle: "Reprocess Failed",
					}}
					skipUploadStep
					step={progressStep}
					onClose={handleCloseProgress}
				/>
			)}

			<div className="flex h-full flex-col gap-6 px-4 py-4">
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<p className="text-base font-semibold text-[#404040]">{t("admin.collection-advice.file-data")}</p>

						<div className="flex items-center gap-3">
							<Input
								className="w-64"
								placeholder={t("admin.collection-advice.order-reference-search-placeholder")}
								value={orderReference}
								onChange={e => setOrderReference(e.target.value)}
								onKeyDown={e => {
									if (e.key === "Enter") handleSearch();
								}}
							/>

							<Button size="default" variant="outline" onClick={handleSearch}>
								{t("admin.collection-advice.search")}
							</Button>

							<Select
								className="w-52"
								value={processStatus}
								onValueChange={handleStatusChange}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("admin.collection-advice.process-status-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t("admin.collection-advice.process-status-all")}</SelectItem>
									{PROCESS_STATUSES.map(s => (
										<SelectItem key={s} value={s}>
											{s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Button
								disabled={!isNewBatch && !hasNotFound}
								loading={isProcessing}
								size="default"
								variant={isNewBatch || hasNotFound ? "default" : "outline"}
								onClick={handleReprocess}
							>
								{isNewBatch ? t("admin.collection-advice.process") : t("admin.collection-advice.reprocess")}
							</Button>
						</div>
					</div>

					<DataTable
						className="flex-1"
						data={fileData}
						emptyMessage="No New Records Inserted"
						headers={[
							/* {
								key: "reference",
								label: t("admin.collection-advice.reference"),
							}, */
							/* {
								key: "merchantReference",
								label: t("admin.collection-advice.merchant-reference"),
							}, */
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
							{
								key: "appliedAmount",
								label: t("admin.collection-advice.applied-amount"),
								render: value => <FormattedNumber value={value} />,
							},
							{
								key: "eligibleAt",
								label: t("admin.collection-advice.eligible-at"),
								render: value => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
							},
							{
								key: "reason",
								label: t("admin.collection-advice.reason"),
							},
							{
								key: "status",
								label: t("admin.collection-advice.status"),
							},
							{
								key: "updatedAt",
								label: t("admin.collection-advice.updated-at"),
								render: value => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
							},

							/* {
								key: "type",
								label: t("admin.collection-advice.type"),
							}, */

							/* {
								key: "order_reference",
								label: t("admin.collection-advice.order-reference"),
							}, */

							/* {
								key: "appliedAt",
								label: t("admin.collection-advice.applied-at"),
								render: value => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
							}, */
							{
								key: "process_status",
								label: t("admin.collection-advice.process-status"),
								render: value => <ProcessStatusBadge value={value} />,
							},
							{
								key: "remarks",
								label: t("admin.collection-advice.remarks"),
								render: value => (
									<span className="block max-w-[260px] truncate text-xs text-gray-500" title={value || ""}>
										{value || "-"}
									</span>
								),
							},
						]}
						loading={isLoadingData}
						onClick={row => {
							setSelectedRow(row);
							setDetailOpen(true);
						}}
					/>

					<Pagination
						currentCount={fileData.length}
						page={page}
						perPage={pageSize}
						setPage={p => setParams({ page: p })}
						totalCount={totalCount}
						showing
						setPerPage={size => setParams({ page: null, pageSize: size })}
					/>
				</div>

				<div className="flex flex-col gap-4">
					<p className="text-base font-semibold text-[#404040]">{t("admin.collection-advice.journal-entries")}</p>

					<PaymentTransactionPanel hideSummary hideReverse batchId={batchId} />
				</div>
			</div>

			<Dialog open={detailOpen} onOpenChange={setDetailOpen}>
				<DialogContent className="max-h-[85vh] w-[80%] max-w-4xl overflow-hidden bg-[#EAF4FB] p-0">
					<div className="flex max-h-[85vh] flex-col overflow-hidden">
						<div className="shrink-0 p-8 pb-4">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-2xl font-bold text-gray-900">{t("admin.collection-advice.row-detail")}</h2>
									{selectedRow && (
										<p className="mt-1 text-sm text-gray-500">{selectedRow.reference || `#${selectedRow.id}`}</p>
									)}
								</div>
								{selectedRow && <ProcessStatusBadge value={selectedRow.process_status} />}
							</div>
						</div>

						<div className="flex-1 overflow-y-auto px-8 pb-8">
							{selectedRow && (
								<div className="flex flex-col gap-6">
									<div>
										<p className="mb-3 border-b border-input pb-2 text-sm font-semibold text-[#404040]">
											{t("admin.collection-advice.identification")}
										</p>
										<div className="grid grid-cols-2 gap-x-6 gap-y-4">
											<DetailField label="ID" value={selectedRow.id} />
											<DetailField label={t("admin.collection-advice.reference")} value={selectedRow.reference} />
											<DetailField label={t("admin.collection-advice.merchant-reference")} value={selectedRow.merchantReference} />
											<DetailField label={t("admin.collection-advice.merchant-name")} value={selectedRow.merchantName} />
											<DetailField label={t("admin.collection-advice.batch-id")} value={selectedRow.batchId} />
											<DetailField label={t("admin.collection-advice.data-id")} value={selectedRow.dataId} />
										</div>
									</div>

									<div>
										<p className="mb-3 border-b border-input pb-2 text-sm font-semibold text-[#404040]">
											{t("admin.collection-advice.status")}
										</p>
										<div className="grid grid-cols-2 gap-x-6 gap-y-4">
											<DetailField label={t("admin.collection-advice.type")} value={selectedRow.type} />
											<DetailField label={t("admin.collection-advice.status")} value={selectedRow.status} />
											<DetailField label={t("admin.collection-advice.pending-review")} value={selectedRow.pendingReview} />
											<DetailField
												label={t("admin.collection-advice.process-status")}
												value={<ProcessStatusBadge value={selectedRow.process_status} />}
											/>
										</div>
									</div>

									<div>
										<p className="mb-3 border-b border-input pb-2 text-sm font-semibold text-[#404040]">
											{t("admin.collection-advice.financial")}
										</p>
										<div className="grid grid-cols-2 gap-x-6 gap-y-4">
											<DetailField label={t("admin.collection-advice.amount")} value={<FormattedNumber value={selectedRow.amount} />} />
											<DetailField label={t("admin.collection-advice.remaining-amount")} value={<FormattedNumber value={selectedRow.remainingAmount} />} />
											<DetailField label={t("admin.collection-advice.applied-amount")} value={<FormattedNumber value={selectedRow.appliedAmount} />} />
											<DetailField label={t("admin.collection-advice.sub-adjustments")} value={selectedRow.subAdjustments} />
										</div>
									</div>

									<div>
										<p className="mb-3 border-b border-input pb-2 text-sm font-semibold text-[#404040]">
											{t("admin.collection-advice.order-details")}
										</p>
										<div className="grid grid-cols-2 gap-x-6 gap-y-4">
											<DetailField label={t("admin.collection-advice.reason")} value={selectedRow.reason} />
											<DetailField label={t("admin.collection-advice.order-reference")} value={selectedRow.order_reference} />
											<DetailField label={t("admin.collection-advice.terminal-id")} value={selectedRow.terminalId} />
											<DetailField label={t("admin.collection-advice.year")} value={selectedRow.year} />
											<DetailField label={t("admin.collection-advice.month")} value={selectedRow.month} />
											<DetailField label={t("admin.collection-advice.load-id")} value={selectedRow.loadId} />
										</div>
									</div>

									<div>
										<p className="mb-3 border-b border-input pb-2 text-sm font-semibold text-[#404040]">
											{t("admin.collection-advice.payment-references")}
										</p>
										<div className="grid grid-cols-2 gap-x-6 gap-y-4">
											<DetailField label={t("admin.collection-advice.applied-on-payment-reference")} value={selectedRow.appliedOnPaymentReference} />
											<DetailField label={t("admin.collection-advice.sub-account-payment-reference")} value={selectedRow.subAccountPaymentReference} />
											<DetailField label={t("admin.collection-advice.creator")} value={selectedRow.creator} />
										</div>
									</div>

									<div>
										<p className="mb-3 border-b border-input pb-2 text-sm font-semibold text-[#404040]">
											{t("admin.collection-advice.date")}
										</p>
										<div className="grid grid-cols-2 gap-x-6 gap-y-4">
											<DetailField
												label={t("admin.collection-advice.eligible-at")}
												value={selectedRow.eligibleAt ? dayjs(selectedRow.eligibleAt).format("DD/MM/YYYY") : "-"}
											/>
											<DetailField
												label={t("admin.collection-advice.applied-at")}
												value={selectedRow.appliedAt ? dayjs(selectedRow.appliedAt).format("DD/MM/YYYY HH:mm") : "-"}
											/>
											<DetailField
												label={t("admin.collection-advice.transferred-at")}
												value={selectedRow.transferredAt ? dayjs(selectedRow.transferredAt).format("DD/MM/YYYY HH:mm") : "-"}
											/>
											<DetailField
												label={t("admin.collection-advice.confirmed-at")}
												value={selectedRow.confirmedAt ? dayjs(selectedRow.confirmedAt).format("DD/MM/YYYY HH:mm") : "-"}
											/>
											<DetailField
												label={t("admin.collection-advice.created-at")}
												value={selectedRow.createdAt ? dayjs(selectedRow.createdAt).format("DD/MM/YYYY HH:mm") : "-"}
											/>
											<DetailField
												label={t("admin.collection-advice.updated-at")}
												value={selectedRow.updatedAt ? dayjs(selectedRow.updatedAt).format("DD/MM/YYYY HH:mm") : "-"}
											/>
											<DetailField
												label={t("admin.collection-advice.date-created")}
												value={selectedRow.dateCreated ? dayjs(selectedRow.dateCreated).format("DD/MM/YYYY HH:mm") : "-"}
											/>
											<DetailField
												label={t("admin.collection-advice.date-modified")}
												value={selectedRow.dateModified ? dayjs(selectedRow.dateModified).format("DD/MM/YYYY HH:mm") : "-"}
											/>
										</div>
									</div>

									{selectedRow.remarks && (
										<div>
											<p className="mb-3 border-b border-input pb-2 text-sm font-semibold text-[#404040]">
												{t("admin.collection-advice.remarks")}
											</p>
											<p className="text-sm text-[#404040]">{selectedRow.remarks}</p>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
