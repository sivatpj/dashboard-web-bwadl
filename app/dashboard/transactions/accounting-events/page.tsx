"use client";

import dayjs from "dayjs";
import { AlertTriangle, FileText } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useFetchAccountingEvents } from "@/api/endpoints/back-office/accounting/fetch-accounting-events";
import { AccountingEventsHeader } from "@/components/entities/admin/dashboard/accounting-events";
import { Pagination } from "@/components/global/pagination";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { cn } from "@/lib/utils";

// ─── Utility helpers ──────────────────────────────────────────────────────────

function fmtKey(k: string): string {
	return k
		.replace(/([A-Z])/g, " $1")
		.replace(/_/g, " ")
		.replace(/^\w/, c => c.toUpperCase())
		.trim();
}

function isIsoDate(v: string): boolean {
	return /^\d{4}-\d{2}-\d{2}(T|$)/.test(v);
}

function isUniformObjectArray(arr: unknown[]): arr is Record<string, unknown>[] {
	if (!arr.length) return false;
	const first = arr[0];
	if (typeof first !== "object" || first === null || Array.isArray(first)) return false;
	const sig = Object.keys(first).sort().join("|");
	return arr.every(
		item =>
			item !== null &&
			typeof item === "object" &&
			!Array.isArray(item) &&
			Object.keys(item as object).sort().join("|") === sig,
	);
}

// ─── Smart primitive renderer ─────────────────────────────────────────────────

function PrimValue({ label, value }: { label: string; value: unknown }) {
	if (value === null || value === undefined)
		return <span className="italic text-gray-300">—</span>;

	if (typeof value === "boolean")
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
					value ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
				)}
			>
				<span
					className={cn("h-1.5 w-1.5 rounded-full", value ? "bg-green-500" : "bg-red-400")}
				/>
				{value ? "Yes" : "No"}
			</span>
		);

	const str = String(value);
	const lk = label.toLowerCase();

	if (typeof value === "string" && isIsoDate(value))
		return (
			<span className="font-mono text-xs text-gray-700">
				{dayjs(value).format("DD MMM YYYY, HH:mm")}
			</span>
		);

	if (
		typeof value === "number" &&
		(lk.includes("amount") || lk.includes("price") || lk.includes("fee"))
	)
		return (
			<span className="font-mono text-sm font-semibold text-gray-800">
				{Number(value).toLocaleString(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 4,
				})}
			</span>
		);

	if (
		lk === "id" ||
		lk.endsWith(" id") ||
		(typeof value === "string" && /^[a-f0-9-]{12,}$/i.test(str))
	)
		return (
			<span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700">
				{str}
			</span>
		);

	return <span className="text-sm leading-relaxed text-gray-800">{str}</span>;
}

// ─── Uniform-object array → rendered as a table ───────────────────────────────

function ArrayTable({
	label,
	items,
}: {
	label: string;
	items: Record<string, unknown>[];
}) {
	const columns = Object.keys(items[0]);

	// Detect if a column is numeric to right-align it
	const isNumericCol = (col: string) =>
		items.every(row => row[col] === null || typeof row[col] === "number");

	return (
		<section className="border-b border-gray-100 last:border-0">
			<header className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50 px-5 py-3">
				<div className="h-4 w-0.5 rounded-full bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
				<span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
					{label}
				</span>
				<span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#2563EB]">
					{items.length} {items.length === 1 ? "entry" : "entries"}
				</span>
			</header>
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-gray-100 bg-gray-50/60">
							{columns.map(col => (
								<th
									key={col}
									className={cn(
										"px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400",
										isNumericCol(col) ? "text-right" : "text-left",
									)}
								>
									{fmtKey(col)}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{items.map((row, i) => (
							<tr key={i} className={i % 2 === 1 ? "bg-gray-50/40" : "bg-white"}>
								{columns.map(col => (
									<td
										key={col}
										className={cn("px-5 py-3", isNumericCol(col) ? "text-right" : "")}
									>
										<PrimValue label={fmtKey(col)} value={row[col]} />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}

// ─── Nested object section ────────────────────────────────────────────────────

function ObjectSection({ label, obj }: { label: string; obj: Record<string, unknown> }) {
	return (
		<section className="border-b border-gray-100 last:border-0">
			<header className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50 px-5 py-3">
				<div className="h-4 w-0.5 rounded-full bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
				<span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
					{label}
				</span>
			</header>
			<ParameterContent data={obj} nested />
		</section>
	);
}

// ─── Main content renderer ────────────────────────────────────────────────────

// Temporarily hidden fields — uncomment / remove from this list to bring them back
const HIDDEN_FIELDS = ["createdAt", "updatedAt", "userVerifiedAt"];

function ParameterContent({
	data,
	nested = false,
}: {
	data: Record<string, unknown>;
	nested?: boolean;
}) {
	const entries = Object.entries(data).filter(([key]) => !HIDDEN_FIELDS.includes(key));
	const simpleEntries = entries.filter(
		([, v]) => v === null || v === undefined || (typeof v !== "object" && !Array.isArray(v)),
	);
	const complexEntries = entries.filter(
		([, v]) => v !== null && v !== undefined && typeof v === "object",
	);

	// Make last simple entry span both columns if count is odd
	const gridCols = nested ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2";

	return (
		<div className={nested ? "pl-4 border-l-2 border-[#4AADE7]/20 ml-5 my-2" : ""}>
			{/* Simple key-value grid — gap-px trick creates clean grid lines */}
			{simpleEntries.length > 0 && (
				<div className={cn("grid gap-px bg-gray-100", gridCols)}>
					{simpleEntries.map(([key, value], idx) => (
						<div
							key={key}
							className={cn(
								"bg-white px-5 py-3.5",
								simpleEntries.length % 2 !== 0 && idx === simpleEntries.length - 1
									? "col-span-2"
									: "",
							)}
						>
							<p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
								{fmtKey(key)}
							</p>
							<PrimValue label={fmtKey(key)} value={value} />
						</div>
					))}
				</div>
			)}

			{/* Complex fields — objects and arrays below the grid */}
			{complexEntries.map(([key, value]) => {
				if (Array.isArray(value)) {
					if (value.length === 0) {
						return (
							<div
								key={key}
								className="flex items-center gap-4 border-b border-gray-100 bg-white px-5 py-3.5 last:border-0"
							>
								<p className="text-xs font-medium uppercase tracking-wide text-gray-400">
									{fmtKey(key)}
								</p>
								<span className="text-sm italic text-gray-300">Empty list</span>
							</div>
						);
					}
					if (isUniformObjectArray(value)) {
						return <ArrayTable key={key} items={value} label={fmtKey(key)} />;
					}
					// primitive array
					return (
						<section key={key} className="border-b border-gray-100 last:border-0">
							<header className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50 px-5 py-3">
								<div className="h-4 w-0.5 rounded-full bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
								<span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
									{fmtKey(key)}
								</span>
								<span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
									{value.length}
								</span>
							</header>
							<ul className="divide-y divide-gray-100">
								{value.map((item, i) => (
									<li key={i} className="flex items-start gap-3 bg-white px-5 py-3">
										<span className="mt-0.5 min-w-[1.5rem] text-xs font-semibold text-[#2D8BC9]">
											{i + 1}.
										</span>
										<span className="min-w-0 flex-1 break-words text-sm text-gray-800">
											{String(item)}
										</span>
									</li>
								))}
							</ul>
						</section>
					);
				}
				// nested object
				return (
					<ObjectSection
						key={key}
						label={fmtKey(key)}
						obj={value as Record<string, unknown>}
					/>
				);
			})}
		</div>
	);
}

// ─── Parameters popup ─────────────────────────────────────────────────────────

function JsonPopup({ title, data }: { title: string; data: Record<string, unknown> | null }) {
	if (!data) return <span className="text-xs italic text-gray-400">Null</span>;

	const totalFields = Object.keys(data).length;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline">
					<FileText className="h-3.5 w-3.5" />
					View
				</Button>
			</DialogTrigger>
			<DialogContent className="flex h-[85vh] w-[90vw] max-w-5xl flex-col gap-0 overflow-hidden rounded-xl p-0">
				{/* Header */}
				<div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-6 py-4">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9] shadow-sm">
						<FileText className="h-4 w-4 text-white" />
					</div>
					<div className="flex-1">
						<DialogTitle className="text-base font-semibold text-gray-800">{title}</DialogTitle>
						<p className="text-xs text-gray-400">
							{totalFields} {totalFields === 1 ? "field" : "fields"}
						</p>
					</div>
				</div>
				{/* Body */}
				<ScrollArea className="min-h-0 flex-1 bg-gray-50/60">
					<div className="m-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
						<ParameterContent data={data} />
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

// ─── Error popup ──────────────────────────────────────────────────────────────

function ErrorPopup({ error }: { error: string | null }) {
	if (!error) return <span className="text-xs italic text-gray-400">Null</span>;

	if (error.length <= 50)
		return (
			<span className="inline-flex items-center gap-1.5 text-sm text-red-600">
				<AlertTriangle className="h-3.5 w-3.5 shrink-0" />
				{error}
			</span>
		);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="max-w-[200px]" size="sm" variant="outline">
					<AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
					<span className="truncate text-red-600">{error.slice(0, 28)}…</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="flex max-h-[70vh] max-w-xl flex-col gap-0 overflow-hidden rounded-xl p-0">
				<div className="flex shrink-0 items-center gap-3 border-b border-red-100 bg-white px-6 py-4">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
						<AlertTriangle className="h-4 w-4 text-red-500" />
					</div>
					<div>
						<DialogTitle className="text-base font-semibold text-red-700">
							Error Details
						</DialogTitle>
						<p className="text-xs text-gray-400">Processing failure message</p>
					</div>
				</div>
				<ScrollArea className="min-h-0 flex-1 bg-red-50/40 p-5">
					<p className="text-sm leading-relaxed text-red-800">{error}</p>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
	Disabled: { bg: "#F3F4F6", dot: "#6B7280", text: "#6B7280" },
	Failed: { bg: "#FEE2E2", dot: "#DC2626", text: "#DC2626" },
	New: { bg: "#EFF6FF", dot: "#2563EB", text: "#2563EB" },
	Processing: { bg: "#FFF7ED", dot: "#C97A1F", text: "#C97A1F" },
	Succeeded: { bg: "#E1FCEF", dot: "#38A06C", text: "#38A06C" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
	const params = useSearchParams();
	const setParams = useSetParams();
	const { t } = useTranslationContext();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(
		params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10",
	);

	const q = params.get("search") || "";
	const sortBy = params.get("sortBy") || "id";
	const sortOrder = (params.get("sortOrder") || "desc") as "asc" | "desc";
	const from = params.get("from") || undefined;
	const to = params.get("to") || undefined;
	const status = params.get("status") || undefined;

	const { data, isPending: isLoading } = useFetchAccountingEvents({
		from,
		limit: pageSize,
		page,
		q,
		sortBy,
		sortOrder,
		status,
		to,
	});

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.sidebar.transactions"),
						href: "/dashboard/transactions",
					},
					{
						position: 1,
						title: t("admin.accounting-events.accounting-events"),
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<AccountingEventsHeader />

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={data?.accountingEvents}
						headers={[
							{
								key: "id",
								label: "ID",
								sortable: true,
							},
							{
								key: "salesOrderId",
								label: t("admin.accounting-events.sales-order-id"),
								sortable: true,
								render: value =>
									value == null ? (
										<span className="text-xs italic text-gray-400">Null</span>
									) : (
										<span>{String(value)}</span>
									),
							},
							{
								key: "invoiceId",
								label: t("admin.accounting-events.invoice-id"),
								sortable: true,
								render: value =>
									value == null ? (
										<span className="text-xs italic text-gray-400">Null</span>
									) : (
										<span>{String(value)}</span>
									),
							},
							{
								key: "parameters",
								label: t("admin.accounting-events.parameters"),
								render: value => (
									<JsonPopup
										title={t("admin.accounting-events.parameters")}
										data={value as Record<string, unknown> | null}
									/>
								),
							},
							{
								key: "valueDate",
								label: t("admin.accounting-events.value-date"),
								sortable: true,
								render: value =>
									value ? (
										<span className="tabular-nums">
											{dayjs(value as string).format("DD/MM/YYYY HH:mm")}
										</span>
									) : (
										<span className="text-xs italic text-gray-400">Null</span>
									),
							},
							{
								key: "attempts",
								label: t("admin.accounting-events.attempts"),
								render: value => {
									const num = Number(value ?? 0);
									return (
										<span
											className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
											style={{
												backgroundColor:
													num === 0 ? "#F3F4F6" : num >= 4 ? "#FEE2E2" : "#FFF7ED",
												color: num === 0 ? "#6B7280" : num >= 4 ? "#DC2626" : "#C97A1F",
											}}
										>
											{num}
										</span>
									);
								},
							},
							{
								key: "lastError",
								label: t("admin.accounting-events.error"),
								render: value => <ErrorPopup error={value as string | null} />,
							},
							{
								key: "collectionBatchId",
								label: t("admin.accounting-events.collection-batch-id"),
								render: value =>
									value == null ? (
										<span className="text-xs italic text-gray-400">Null</span>
									) : (
										<span className="font-mono text-xs text-gray-700">{String(value)}</span>
									),
							},
							{
								key: "createdAt",
								label: t("admin.accounting-events.created-at"),
								sortable: true,
								render: value =>
									value ? (
										<span className="tabular-nums">
											{dayjs(value as string).format("DD/MM/YYYY HH:mm")}
										</span>
									) : (
										<span className="text-xs italic text-gray-400">Null</span>
									),
							},
							/* {
								key: "createdBy",
								label: t("admin.accounting-events.created-by"),
								render: value =>
									value == null ? (
										<span className="text-xs italic text-gray-400">Null</span>
									) : (
										<span>{String(value)}</span>
									),
							}, */
							{
								key: "status",
								label: t("admin.accounting-events.status"),
								sortable: true,
								render: value => {
									const colors =
										STATUS_COLORS[String(value)] ?? STATUS_COLORS["Disabled"];
									return (
										<div
											className="inline-flex items-center gap-2 rounded-lg px-2 py-1"
											style={{ backgroundColor: colors.bg, color: colors.text }}
										>
											<div
												className="h-2 w-2 rounded-full"
												style={{ backgroundColor: colors.dot }}
											/>
											<span className="font-light">{String(value ?? "-")}</span>
										</div>
									);
								},
							},
						]}
						loading={isLoading}
						sortKey={sortBy}
						sortOrder={sortOrder}
						onSortBy={(key, dir) => setParams({ page: null, sortBy: key || "", sortOrder: dir })}
					/>
				</div>

				<Pagination
					currentCount={data?.accountingEvents?.length || 0}
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
