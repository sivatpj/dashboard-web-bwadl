"use client";

import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useFetchTransfers } from "@/api/endpoints/back-office/transfers/fetch-transfers";
import {
	CashInPopUp,
	CashOutPopUp,
	InternalTransferPopUp,
	TransferPurposeTypeFilter,
} from "@/components/entities/admin/dashboard/transfers";
import { FormattedNumber } from "@/components/global/formatted-number";
import { Icon } from "@/components/global/icon";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { Calendar } from "@/components/ui/calendar";
import { DataTable } from "@/components/ui/data-table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

const TRANSFER_TYPES = ["Cash-In", "Cash-Out", "Internal Transfer"];

export default function Page(props: PageProps<"/dashboard/transfers">) {
	const params = useSearchParams();
	const router = useRouter();
	const setParams = useSetParams();
	const { t } = useTranslationContext();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(
		params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10",
	);
	const from = params.get("from") || undefined;
	const to = params.get("to") || undefined;
	const transferType = params.get("transferType") || undefined;
	const purposeTypeId = params.get("purposeTypeId") || undefined;

	const [fromDate, setFromDate] = useState<Date | undefined>(from ? dayjs(from).toDate() : undefined);
	const [toDate, setToDate] = useState<Date | undefined>(to ? dayjs(to).toDate() : undefined);

	const setDebouncedFromDate = useDebouncedCallback(
		(value: Date | undefined) =>
			setParams({ from: value ? dayjs(value).format("YYYY-MM-DD") : null, page: null }),
		500,
	);
	const setDebouncedToDate = useDebouncedCallback(
		(value: Date | undefined) =>
			setParams({ page: null, to: value ? dayjs(value).format("YYYY-MM-DD") : null }),
		500,
	);

	const { data, isPending, refetch } = useFetchTransfers({
		from,
		limit: pageSize,
		page,
		purposeTypeId: purposeTypeId ? Number(purposeTypeId) : undefined,
		to,
		transferType,
	});

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.transfers.transfers"),
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				{/* Filters */}
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap items-center gap-3">
					<Popover>
						<PopoverTrigger asChild>
							<button
								className="flex items-center justify-between gap-16 rounded-sm border bg-white px-4 py-2 shadow-sm"
								type="button"
							>
								<span className="text-sm text-muted-foreground">
									{fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : "__/__/__"}
								</span>
								<Icon className="h-4 w-4" name="Calendar" />
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								disabled={toDate ? date => date > toDate : undefined}
								mode="single"
								selected={fromDate}
								onSelect={date => {
									setFromDate(date);
									setDebouncedFromDate(date);
								}}
							/>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger asChild>
							<button
								className="flex items-center justify-between gap-16 rounded-sm border bg-white px-4 py-2 shadow-sm"
								type="button"
							>
								<span className="text-sm text-muted-foreground">
									{toDate ? dayjs(toDate).format("DD/MM/YYYY") : "__/__/__"}
								</span>
								<Icon className="h-4 w-4" name="Calendar" />
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								disabled={fromDate ? date => date < fromDate : undefined}
								mode="single"
								selected={toDate}
								initialFocus
								onSelect={date => {
									setToDate(date);
									setDebouncedToDate(date);
								}}
							/>
						</PopoverContent>
					</Popover>

					<Select
						value={transferType || "all"}
						onValueChange={value => setParams({ page: null, transferType: value === "all" ? null : value })}
					>
						<SelectTrigger className="h-auto w-auto min-w-[140px] rounded-sm border bg-white px-4 py-2 shadow-sm">
							<SelectValue placeholder={t("admin.transfers.all")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t("admin.transfers.all")}</SelectItem>
							{TRANSFER_TYPES.map(type => (
								<SelectItem key={type} value={type}>
									{type}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<TransferPurposeTypeFilter
						value={purposeTypeId}
						onChange={value => setParams({ page: null, purposeTypeId: value })}
					/>
					<CashInPopUp onSuccess={refetch} />
					<CashOutPopUp onSuccess={refetch} />
					<InternalTransferPopUp onSuccess={refetch} />
				</div>
			</div>

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={data?.transfers}
						loading={isPending}
						headers={[
							{
								key: "createdAt",
								label: t("admin.transfers.date"),
								render: value => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"),
							},
							{
								key: "transferType",
								label: t("admin.transfers.type"),
							},
							{
								key: "transferNote",
								label: t("admin.transfers.note"),
								render: value => value || "-",
							},
							{
								key: "purposeType",
								label: t("admin.transfers.purpose-type"),
								render: value => value ?? "-",
							},
							{
								alignment: "right",
								key: "amount",
								label: <RiyalTitle>{t("admin.transfers.amount")}</RiyalTitle>,
								render: value => <FormattedNumber value={Number(value)} />,
							},
							{
								key: "createdBy",
								label: t("admin.common.action-by"),
								render: value => value?.nameEn || value?.email || "-",
							},
							/* {
								key: "journalEntryId",
								label: t("admin.transfers.journal-entry"),
								render: value =>
									value ? (
										<span className="cursor-pointer text-blue-600 underline">
											#{value}
										</span>
									) : (
										"-"
									),
							}, */
						]}
						onClick={row => {
							router.push(config.PATHS.dashboard.ADMIN.transfer(row.transferId));
						}}
					/>
				</div>

				<Pagination
					currentCount={data?.transfers.length || 0}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={data?.totalCount || 0}
					setPerPage={pageSize => setParams({ page: null, pageSize })}
					showing
				/>
			</div>
		</>
	);
}
