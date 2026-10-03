"use client";

import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFetchCollectorsGet } from "@/api/endpoints/back-office/collection-advice/fetch-collectors-get";
import { useFetchFileHeaders } from "@/api/endpoints/back-office/collection-advice/fetch-file-headers";
import { useFileProcess } from "@/api/endpoints/back-office/collection-advice/file-process.api";
import { useFileUpload } from "@/api/endpoints/back-office/collection-advice/file-upload.api";
import { useReverseFileUploadPayment } from "@/api/endpoints/back-office/collection-advice/reverse-file-upload-payment";
import { IFileHeader } from "@/api/types";
import { Pagination } from "@/components/global/pagination";
import { Icon } from "@/components/global/icon";
import { ProgressModal, type ProgressStep } from "@/components/global/progress-modal";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";
import { useSetParams } from "@/hooks/use-set-params";

function ReverseUploadConfirmDialog({
	open,
	onClose,
	onConfirm,
	isPending,
}: {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isPending: boolean;
}) {
	const { t } = useTranslationContext();

	return (
		<Dialog open={open} onOpenChange={v => !v && onClose()}>
			<DialogContent className="h-auto w-[70%] max-w-xl bg-[#EAF4FB] p-0">
				<div className="p-8">
					<div className="flex items-start gap-4">
						<div className="rounded-full bg-red-100 p-3">
							<Icon name="WarningTriangle" className="fill-red-600" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">
								{t("admin.collection-advice.reverse-payment") || "Reverse Payment"}
							</h2>
							<p className="mt-4 text-lg text-gray-700">
								{t("admin.collection-advice.confirm-reverse-payment") ||
									"Reverse this collection advice upload's payment? This will reinstate the source collections, post mirrored reversal journal entries, and allow these rows to be re-applied in a future upload."}
							</p>
						</div>
					</div>

					<div className="mt-8 flex justify-end gap-4">
						<Button
							className="h-10 w-[225px] border border-black bg-[#969696] text-[#000000] hover:bg-[#969696]"
							type="button"
							disabled={isPending}
							onClick={onClose}
						>
							{t("admin.common.cancel") || "Cancel"}
						</Button>

						<Button
							className="h-10 w-[225px] bg-[#E05A5A] font-semibold text-white hover:bg-[#d14a4a]"
							type="button"
							loading={isPending}
							onClick={onConfirm}
						>
							{t("admin.collection-advice.reverse-payment") || "Reverse Payment"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function ReverseStatusModal({ step, onClose }: { step: "loading" | "done"; onClose: () => void }) {
	const { t } = useTranslationContext();
	const isDone = step === "done";

	return (
		<Dialog open onOpenChange={v => !v && isDone && onClose()}>
			<DialogContent
				className={`h-auto w-[70%] max-w-sm bg-white p-0 ${isDone ? "" : "[&>button]:hidden"}`}
				onEscapeKeyDown={e => !isDone && e.preventDefault()}
				onInteractOutside={e => !isDone && e.preventDefault()}
			>
				<div className="flex flex-col items-center gap-4 p-8">
					<div
						className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 ${
							isDone ? "bg-green-50" : "bg-[#f5f5f5]"
						}`}
					>
						{isDone ? (
							<CheckCircle2 className="h-7 w-7 text-green-600" />
						) : (
							<Loader2 className="h-7 w-7 animate-spin text-[#404040]" />
						)}
					</div>

					<div className="text-center">
						<p className="text-sm font-semibold text-[#404040]">
							{isDone
								? t("admin.collection-advice.payment-reversed") || "Payment Reversed"
								: t("admin.collection-advice.reversing-payment") || "Reversing Payment"}
						</p>
						<p className="mt-1 text-xs text-gray-500">
							{isDone
								? t("admin.collection-advice.reverse-payment-success-description") ||
									"The collection advice payment has been reversed successfully."
								: t("admin.collection-advice.reversing-payment-description") ||
									"Please wait while we reverse this payment…"}
						</p>
					</div>

					{isDone && (
						<Button className="w-full" size="default" onClick={onClose}>
							{t("admin.common.close") || "Close"}
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default function Page(props: PageProps<"/dashboard/file-upload/upload-list">) {
	const router = useRouter();
	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const params = useSearchParams();
	const setParams = useSetParams();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [collectorId, setCollectorId] = useState<string>("");
	const [uploadDate, setUploadDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
	const [progressStep, setProgressStep] = useState<ProgressStep | null>(null);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [reversingBatchId, setReversingBatchId] = useState<string | null>(null);
	const [confirmReverseHeader, setConfirmReverseHeader] = useState<IFileHeader | null>(null);
	const [reverseStep, setReverseStep] = useState<"loading" | "done" | null>(null);

	const { data: headersData, isPending: isHeadersLoading } = useFetchFileHeaders({ page, limit: pageSize });
	const { data: collectorsData } = useFetchCollectorsGet();

	const { mutate: reverseFileUploadPayment } = useReverseFileUploadPayment({
		onError: (err: any) => {
			toast({
				description: err.response?.data?.message || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
			setReversingBatchId(null);
			setReverseStep(null);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "collection-advice", "file-headers"] });
			setReversingBatchId(null);
			setReverseStep("done");
		},
	});

	const handleReverseClick = (e: React.MouseEvent, header: IFileHeader) => {
		e.stopPropagation();
		setConfirmReverseHeader(header);
	};

	const confirmReverse = () => {
		if (!confirmReverseHeader) return;
		setReversingBatchId(confirmReverseHeader.batchId);
		setReverseStep("loading");
		reverseFileUploadPayment(confirmReverseHeader.batchId);
		setConfirmReverseHeader(null);
	};

	const currentCollectors = collectorsData?.collectors?.filter(c => c.is_current);

	useEffect(() => {
		if (!currentCollectors?.length || collectorId) return;
		const foodicsPay = currentCollectors.find(c => c.collector_name === "Foodics Pay");
		if (foodicsPay) setCollectorId(String(foodicsPay.id));
	}, [currentCollectors]);

	const { mutate: processFile } = useFileProcess({
		onSuccess: (_, variables) => {
			setProgressStep("done");
			router.push(config.PATHS.dashboard.ADMIN.fileUploadListDetail(variables.batch_id));
		},
		onError: (err: any) => {
			setErrorMessage(err?.response?.data?.message || err?.message || "Processing failed. Please try again.");
			setProgressStep("error");
		},
	});

	const { mutate: uploadFile } = useFileUpload({
		onSuccess: response => {
			setSelectedFile(null);
			setCollectorId("");
			setUploadDate(dayjs().format("YYYY-MM-DD"));
			if (fileInputRef.current) fileInputRef.current.value = "";

			if (response.batch_id) {
				setProgressStep("processing");
				processFile({ batch_id: response.batch_id, reprocess: false });
			}
		},
		onError: (err: any) => {
			setErrorMessage(err?.response?.data?.message || err?.message || "Upload failed. Please check your file and try again.");
			setProgressStep("error");
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedFile(e.target.files?.[0] ?? null);
	};

	const handleUpload = () => {
		if (!selectedFile || !collectorId || !uploadDate) return;
		setErrorMessage("");
		setProgressStep("uploading");
		uploadFile({ collectorId: Number(collectorId), file: selectedFile, date: uploadDate });
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
					},
				]}
			/>

			{progressStep && (
				<ProgressModal
					errorMessage={errorMessage}
					step={progressStep}
					onClose={handleCloseProgress}
				/>
			)}

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<div className="flex flex-col gap-4 rounded-[5px] border border-input bg-white p-4 shadow-sm">
					<p className="text-sm font-semibold text-[#404040]">{t("admin.collection-advice.upload-file")}</p>
					<p className="text-xs text-gray-500">{t("admin.collection-advice.upload-file-description")}</p>

					<div className="flex flex-wrap items-end gap-4">
						<div className="flex flex-col gap-1">
							<label className="text-sm text-[#404040]">{t("admin.collection-advice.choose-file")}</label>
							<input
								ref={fileInputRef}
								accept=".csv,.xlsx,.xls"
								className="block h-12 w-72 rounded-[5px] border-[0.5px] border-[#D9D9D9] bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-[5px] file:border-0 file:bg-[#404040] file:px-3 file:py-1 file:text-xs file:text-white"
								type="file"
								onChange={handleFileChange}
							/>
						</div>

						<Select
							className="w-56"
							disabled
							label={t("admin.collection-advice.collector-id")}
							value={collectorId}
							onValueChange={setCollectorId}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("admin.collection-advice.collector-placeholder")} />
							</SelectTrigger>
							<SelectContent>
								{currentCollectors?.map(c => (
									<SelectItem key={c.id} value={String(c.id)}>
										{c.collector_name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="flex flex-col gap-1">
							<label className="text-sm text-[#404040]">{t("admin.collection-advice.date")}</label>
							<DateInput
								className="w-40"
								disableFutureDates
								value={uploadDate}
								onChange={date => setUploadDate(date ? dayjs(date).format("YYYY-MM-DD") : date)}
							/>
						</div>

						<Button
							disabled={!selectedFile || !collectorId || !uploadDate}
							size="default"
							onClick={handleUpload}
						>
							{t("admin.collection-advice.upload-file")}
						</Button>
					</div>
				</div>

				<DataTable
					className="flex-1"
					data={headersData?.headers}
					headers={[
						{
							key: "batchId",
							label: t("admin.collection-advice.batch-id"),
						},
						{
							key: "fileName",
							label: t("admin.collection-advice.file-name"),
						},
						{
							key: "fileSeq",
							label: t("admin.collection-advice.file-seq"),
						},
						{
							key: "date",
							label: t("admin.collection-advice.date"),
							render: value => (value ? dayjs(value).format("DD/MM/YYYY") : "-"),
						},
						{
							key: "collectorName",
							label: t("admin.collection-advice.collector-name"),
						},
						{
							key: "status",
							label: t("admin.collection-advice.status"),
							render: value => (
								<span
									className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
										value === "Completed"
											? "bg-green-100 text-green-700"
											: value === "Processing"
												? "bg-blue-100 text-blue-700"
												: "bg-gray-100 text-gray-600"
									}`}
								>
									{value || "-"}
								</span>
							),
						},
						{
							key: "batchId" as any,
							label: t("admin.collection-advice.reverse-payment") || "Reverse Payment",
							render: (_value, row, index) => {
								const header = row as unknown as IFileHeader;
								const isLatest = page === 1 && index === 0;
								if (!isLatest) return null;
								return (
									<div data-ignore-row>
										<Button
											disabled={reversingBatchId === header.batchId}
											loading={reversingBatchId === header.batchId}
											size="sm"
											variant="outline"
											onClick={e => handleReverseClick(e, header)}
										>
											{t("admin.collection-advice.reverse-payment") || "Reverse Payment"}
										</Button>
									</div>
								);
							},
						},
					]}
					loading={isHeadersLoading}
					onClick={row => router.push(config.PATHS.dashboard.ADMIN.fileUploadListDetail((row as any).batchId))}
				/>

				<ReverseUploadConfirmDialog
					isPending={reversingBatchId !== null}
					open={!!confirmReverseHeader}
					onClose={() => setConfirmReverseHeader(null)}
					onConfirm={confirmReverse}
				/>

				{reverseStep && <ReverseStatusModal step={reverseStep} onClose={() => setReverseStep(null)} />}

				<Pagination
					currentCount={headersData?.headers?.length}
					page={page}
					perPage={pageSize}
					setPage={p => setParams({ page: p })}
					totalCount={headersData?.totalCount}
					showing
					setPerPage={size => setParams({ page: null, pageSize: size })}
				/>
			</div>
		</>
	);
}
