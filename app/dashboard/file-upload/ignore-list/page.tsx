"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFetchIgnoredList } from "@/api/endpoints/back-office/collection-advice/fetch-ignored-list";
import { useIgnoredOrdersUpload } from "@/api/endpoints/back-office/collection-advice/ignored-orders-upload.api";
import { Pagination } from "@/components/global/pagination";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

export default function Page(props: PageProps<"/dashboard/file-upload/ignore-list">) {
	const { t } = useTranslationContext();

	const params = useSearchParams();
	const setParams = useSetParams();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadResult, setUploadResult] = useState<{
		rows_parsed?: number;
		rows_inserted?: number;
		rows_skipped_invalid?: number;
		rows_skipped_duplicate?: number;
		message?: string;
	} | null>(null);

	const { data: ignoredListData, isPending: isIgnoredLoading, refetch } = useFetchIgnoredList({ page, limit: pageSize });

	const { mutate: uploadIgnoredOrders, isPending: isUploading } = useIgnoredOrdersUpload({
		onSuccess: response => {
			setUploadResult({
				message: response.message,
				rows_inserted: response.rows_inserted,
				rows_parsed: response.rows_parsed,
				rows_skipped_duplicate: response.rows_skipped_duplicate,
				rows_skipped_invalid: response.rows_skipped_invalid,
			});
			setSelectedFile(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
			refetch();
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		setSelectedFile(file);
		setUploadResult(null);
	};

	const handleUpload = () => {
		if (!selectedFile) return;
		uploadIgnoredOrders({ file: selectedFile });
	};

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 1,
						title: t("admin.collection-advice.ignore-list"),
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<div className="flex flex-col gap-4 rounded-[5px] border border-input bg-white p-4 shadow-sm">
					<p className="text-sm font-semibold text-[#404040]">{t("admin.collection-advice.upload-ignore-list")}</p>
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

						<Button disabled={!selectedFile} loading={isUploading} size="default" onClick={handleUpload}>
							{t("admin.collection-advice.ignored-orders-upload")}
						</Button>
					</div>

					{uploadResult && (
						<div className="flex flex-col gap-3 rounded-[5px] border border-green-200 bg-green-50 p-3">
							<p className="text-sm font-semibold text-green-700">{uploadResult.message}</p>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
								<div className="flex flex-col rounded-[5px] border border-green-200 bg-white p-2">
									<span className="text-xs text-gray-500">{t("admin.collection-advice.rows-parsed")}</span>
									<span className="text-sm font-semibold text-gray-800">{uploadResult.rows_parsed ?? "-"}</span>
								</div>
								<div className="flex flex-col rounded-[5px] border border-green-200 bg-white p-2">
									<span className="text-xs text-gray-500">{t("admin.collection-advice.rows-inserted")}</span>
									<span className="text-sm font-semibold text-green-700">{uploadResult.rows_inserted ?? "-"}</span>
								</div>
								<div className="flex flex-col rounded-[5px] border border-yellow-200 bg-white p-2">
									<span className="text-xs text-gray-500">{t("admin.collection-advice.rows-skipped-invalid")}</span>
									<span className="text-sm font-semibold text-yellow-700">
										{uploadResult.rows_skipped_invalid ?? "-"}
									</span>
								</div>
								<div className="flex flex-col rounded-[5px] border border-orange-200 bg-white p-2">
									<span className="text-xs text-gray-500">
										{t("admin.collection-advice.rows-skipped-duplicate")}
									</span>
									<span className="text-sm font-semibold text-orange-700">
										{uploadResult.rows_skipped_duplicate ?? "-"}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>

				<p className="text-base font-semibold text-[#404040]">{t("admin.collection-advice.ignore-list-title")}</p>

				<DataTable
					className="flex-1"
					data={ignoredListData?.ignoredOrders}
					headers={[
						{
							key: "id",
							label: "ID",
						},
						{
							key: "merchantReference",
							label: t("admin.collection-advice.merchant-reference"),
						},
						{
							key: "order_reference",
							label: t("admin.collection-advice.order-reference"),
						},
					]}
					loading={isIgnoredLoading}
				/>

				<Pagination
					currentCount={ignoredListData?.ignoredOrders?.length}
					page={page}
					perPage={pageSize}
					setPage={p => setParams({ page: p })}
					totalCount={ignoredListData?.totalCount}
					showing
					setPerPage={size => setParams({ page: null, pageSize: size })}
				/>
			</div>
		</>
	);
}
