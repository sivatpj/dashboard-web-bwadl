import clsx from "clsx";
import dayjs from "dayjs";
import { LoaderIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useFetchStatement } from "@/api/endpoints/back-office/banks/fetch-statement";
import { IAccount } from "@/api/types/account";
import { Pagination } from "@/components/global/pagination";
import { HighlightText } from "@/components/global/highlight-text";
import { Icon } from "@/components/global/icon";
import { DateInput } from "@/components/ui/date-input-txn";
import { Input } from "@/components/ui/input";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

interface AccountInformationProps extends IAccount {}

function formatAmount(n?: number) {
	if (n === undefined || n === null) return "";
	const abs = Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 3, minimumFractionDigits: 3 });
	return n < 0 ? `-${abs}` : abs;
}

function formatBalance(n?: number) {
	if (n === undefined || n === null) return "";
	return n.toLocaleString(undefined, { maximumFractionDigits: 3, minimumFractionDigits: 3 });
}

export const AccountInformation = (props: AccountInformationProps) => {
	const { t } = useTranslationContext();

	const accountCode = props.accountCode ?? t("admin.statements.default-account-code");
	const accountName = props.accountName ?? t("admin.statements.default-account-name");

	const defaultFromDate = dayjs().subtract(30, "day").format("YYYY-MM-DD");
	const defaultToDate = dayjs().format("YYYY-MM-DD");

	const [fromDate, setFromDate] = useState<string | undefined>(defaultFromDate);
	const [toDate, setToDate] = useState<string | undefined>(defaultToDate);
	const [search, setSearch] = useState<string>("");

	const params = useSearchParams();
	const setParams = useSetParams();

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const debouncedSetSearch = useDebouncedCallback((value: string) => {
		setSearch(value);
		setParams({ page: null });
	}, 600);
	const debouncedSetFromDate = useDebouncedCallback((date?: string) => {
		setFromDate(date);
		setParams({ page: null });
	}, 300);
	const debouncedSetToDate = useDebouncedCallback((date?: string) => {
		setToDate(date);
		setParams({ page: null });
	}, 300);

	const formattedFrom = fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : undefined;
	const formattedTo = toDate ? dayjs(toDate).format("YYYY-MM-DD") : undefined;

	const { data: statementData, isLoading: isStatementLoading } = useFetchStatement({
		accountId: props.id,
		from: formattedFrom || defaultFromDate,
		limit: pageSize,
		page,
		q: search || undefined,
		to: formattedTo || defaultToDate,
	});

	const statementLines = (statementData?.statement?.statement || []) as Array<{
		DATE: string;
		REFERENCE: string;
		DESCRIPTION: string;
		AMOUNT: number;
		RUNNING_BALANCE: number;
	}>;

	const rows = statementLines.map(line => ({
		amount: line.AMOUNT,
		balance: line.RUNNING_BALANCE,
		date: line.DATE,
		description: line.DESCRIPTION.includes("|") ? line.DESCRIPTION.split("|") : line.DESCRIPTION,
		reference: line.REFERENCE,
	}));

	return (
		<div className="flex h-full flex-col gap-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<DateInput
						className="w-[150px]"
						placeholder="__/__/__"
						value={fromDate}
						onChange={iso => {
							setFromDate(iso);
							debouncedSetFromDate(iso);
						}}
					/>
					<DateInput
						className="w-[150px]"
						placeholder="__/__/__"
						value={toDate}
						onChange={iso => {
							setToDate(iso);
							debouncedSetToDate(iso);
						}}
					/>
				</div>

				<Input
					className="md:w-1/2"
					defaultValue={search}
					icon={<Icon className="h-4 w-4" name="Search" />}
					iconPosition="right"
					placeholder={t("admin.statements.search-id")}
					type="text"
					onChange={e => debouncedSetSearch(e.target.value)}
				/>
			</div>

			<div className="rounded-lg border bg-white p-4 shadow-sm">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex-row">
						<span className="font-bold">{t("admin.statements.account-name-label")} </span>
						<span className="font-medium">{accountName}</span>

						<div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
							<span className="rounded-full bg-[#EFF5F9] px-2 font-medium">
								{t("admin.statements.account-code")}: {accountCode}
							</span>

							<span className="flex items-center font-bold gap-2 rounded-full p-1 bg-[#F6F6F9] ">
								{t("admin.statements.currency")}
								<Icon className="w-4" name="Riyal" />
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border bg-white shadow-sm">
				{isStatementLoading && (
					<div className="flex items-center gap-2 p-4 text-sm text-[#404040]">
						<LoaderIcon className="h-4 w-4 animate-spin" />
						<span>{t("global.loading")}</span>
					</div>
				)}
				<div className="overflow-x-auto">
					<table className="w-full table-fixed border-collapse text-sm">
						<thead>
							<tr className="bg-[#F6FAFD] text-left text-xs font-semibold uppercase tracking-wide text-[#4A6075]">
								<th className="w-[140px] px-4 py-3">{t("admin.statements.date")}</th>
								<th className="w-[280px] px-4 py-3">{t("admin.statements.reference")}</th>
								<th className="px-4 py-3">{t("admin.statements.description")}</th>
								<th className="w-[140px] px-4 py-3 text-right">{t("admin.statements.amount")}</th>
								<th className="w-[140px] px-4 py-3 text-right">{t("admin.statements.balance")}</th>
							</tr>
						</thead>

						<tbody>
							{rows.length === 0 && !isStatementLoading && (
								<tr>
									<td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-500">
										{t("global.no-data-found")}
									</td>
								</tr>
							)}
							{rows.map((r, idx) => {
								const isSummary = false;
								const isReversal = r.reference?.startsWith("REV-");
								return (
									<tr
										key={idx}
										className={clsx(
											"border-t",
											isSummary ? "bg-[#FBFDFE]" : "bg-white",
											idx % 2 === 1 && !isSummary && "bg-[#FAFCFF]",
										)}
									>
										<td className={clsx("px-4 py-3 align-top", isReversal ? "text-red-600" : "text-[#1a1a1a]")}>
											{r.date ?? ""}
										</td>
										<td className="px-4 py-3 align-top">
											<span
												className={clsx("font-medium truncate block", isReversal ? "text-red-600" : "text-[#1a1a1a]")}
											>
												<HighlightText query={search} text={r.reference ?? ""} />
											</span>
										</td>
										<td className="px-4 py-3 align-top">
											{Array.isArray(r.description) ? (
												<div className="flex flex-col gap-0.5">
													{r.description.map((line, i) => (
														<span
															key={i}
															className={clsx(
																"truncate",
																i === 0 && "font-medium",
																isReversal ? "text-red-600" : "text-[#1a1a1a]",
															)}
														>
															<HighlightText query={search} text={line} />
														</span>
													))}
												</div>
											) : (
												<span className={clsx("font-medium", isReversal ? "text-red-600" : "text-[#1a1a1a]")}>
													<HighlightText query={search} text={r.description as string} />
												</span>
											)}
										</td>

										<td
											className={clsx(
												"px-4 py-3 align-top text-right tabular-nums",
												isReversal ? "text-red-600" : r.amount! < 0 ? "text-[#B42318]" : "text-[#1F6B3A]",
											)}
										>
											{r.amount !== undefined ? formatAmount(r.amount) : ""}
										</td>

										<td
											className={clsx(
												"px-4 py-3 align-top text-right tabular-nums",
												isReversal ? "text-red-600" : "text-[#1a1a1a]",
											)}
										>
											{formatBalance(r.balance)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			<Pagination
				currentCount={rows.length}
				page={page}
				perPage={pageSize}
				setPage={page => setParams({ page })}
				totalCount={statementData?.statement?.totalCount}
				showing
				setPerPage={pageSize => setParams({ page: null, pageSize })}
			/>
		</div>
	);
};
