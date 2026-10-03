"use client";

import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useFetchJournalEntryLines } from "@/api/endpoints/back-office/collection-advice/fetch-journal-entries";
import { useFetchCollectionsByJournal } from "@/api/endpoints/back-office/collections/fetch-collections-by-journal";
import { useFetchPaymentTransactionsList } from "@/api/endpoints/back-office/collections/fetch-payment-transactions-list";
import { useReversePaymentTransaction } from "@/api/endpoints/back-office/collections/reverse-payment-transaction";
import { IPaymentTransaction, IPaymentTransactionJournal } from "@/api/types";
import { CollectionStatusPill } from "@/components/entities/admin/dashboard/invoices/collection-status-pill";
import { config } from "@/constants/config";
import { DetailCard } from "@/components/global/detail-card";
import { FormattedNumber } from "@/components/global/formatted-number";
import { Icon } from "@/components/global/icon";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format-currency";

const DEFAULT_PAGE_SIZE = 10;

const REVERSAL_STATUSES = ["reverse_created", "reversed"];

interface PaymentTransactionPanelProps {
	buyerId?: number;
	salesOrderId?: number;
	invoiceId?: number;
	batchId?: string;
	hideSummary?: boolean;
	hideReverse?: boolean;
}

function statusPillColors(status: string) {
	const normalized = (status || "").toLowerCase();
	if (normalized === "reversed" || normalized === "reverse_created") {
		return { color: "#C0392B", dot: "#C0392B" };
	}
	if (normalized === "posted" || normalized === "post_created" || normalized === "created") {
		return { color: "#38A06C", dot: "#38A06C" };
	}
	return { color: "#C97A1F", dot: "#C97A1F" };
}

function PaymentDateCell({ journalId }: { journalId?: number }) {
	const { data, isLoading } = useFetchCollectionsByJournal(journalId, { limit: 1 }, { staleTime: 5 * 60 * 1000 });
	const appliedAt = data?.collections?.[0]?.appliedAt;

	if (!journalId) return <>-</>;
	if (isLoading) return <>…</>;
	if (!appliedAt) return <>-</>;

	// appliedAt is stored in UTC; Saudi Arabia is UTC+3
	return <>{dayjs(appliedAt).add(3, "hour").format("DD MMM, YYYY")}</>;
}

function StatusPill({ status }: { status: string }) {
	const { color, dot } = statusPillColors(status);
	return (
		<div
			className="inline-flex items-center gap-2 rounded-lg px-2 py-1"
			style={{ backgroundColor: `${color}1A`, color }}
		>
			<div className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
			<span className="font-light">{status || "-"}</span>
		</div>
	);
}

function JournalDialog({
	journal,
	open,
	onClose,
}: {
	journal: IPaymentTransactionJournal | null;
	open: boolean;
	onClose: () => void;
}) {
	const { t } = useTranslationContext();
	const effectiveJournalEntryId = journal?.journalEntryId ?? journal?.reverseJournalEntryId ?? undefined;
	const { data: linesData, isLoading: isLoadingLines } = useFetchJournalEntryLines(effectiveJournalEntryId);

	const [collectionsPage, setCollectionsPage] = useState(1);
	const [collectionsPerPage, setCollectionsPerPage] = useState(config.PAYMENT_TRANSACTION_PAGE_SIZE_OPTIONS[0]);

	const { data: collectionsData, isLoading: isLoadingCollections } = useFetchCollectionsByJournal(
		effectiveJournalEntryId,
		{ limit: collectionsPerPage, page: collectionsPage },
	);

	useEffect(() => {
		setCollectionsPage(1);
	}, [effectiveJournalEntryId]);

	if (!journal) return null;

	const lines = linesData?.lines ?? [];
	const collections = collectionsData?.collections ?? [];
	const totalCollectionsCount = collectionsData?.totalCount ?? 0;
	const totalDebit = lines.reduce((s, l) => s + (l.debitAmount ?? 0), 0);
	const totalCredit = lines.reduce((s, l) => s + (l.creditAmount ?? 0), 0);
	const initial = journal.referenceNumber?.trim()?.charAt(0)?.toUpperCase() || "J";
	const isReversal = REVERSAL_STATUSES.includes(journal.status);

	return (
		<Dialog open={open} onOpenChange={v => !v && onClose()}>
			<DialogContent className="h-auto w-[90%] max-w-6xl bg-[#EAF4FB] p-0">
				<ScrollArea className="max-h-[90vh]">
					<div className="flex flex-col gap-6 p-8">
						{/* Header */}
						<div className="flex flex-col gap-5">
							<div className="flex items-start gap-4">
								<div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#404040] text-[22px] font-bold text-white">
									{initial}
								</div>
								<div className="flex flex-col gap-2">
									<div className="flex flex-wrap items-center gap-3">
										<h2 className="text-[18px] font-bold leading-snug text-[#404040]">
											{journal.referenceNumber || "-"}
										</h2>
										<StatusPill status={journal.status} />
									</div>
									<div className="flex flex-wrap items-center gap-2 text-[14px] text-[#4A4A4A]">
										<span>
											{t("admin.transactions.date")}{" "}
											<span className="font-bold">
												{journal.createdAt ? dayjs(journal.createdAt).format("DD MMM, YYYY") : "-"}
											</span>
										</span>
										<span className="text-[#808080]">•</span>
										<span>
											{t("admin.transactions.currency")} <span className="font-bold">SAR</span>
										</span>
										{journal.journalEntryId && (
											<>
												<span className="text-[#808080]">•</span>
												<span>
													Journal Entry ID <span className="font-bold">{journal.journalEntryId}</span>
												</span>
											</>
										)}
										{journal.reverseJournalEntryId && (
											<>
												<span className="text-[#808080]">•</span>
												<span>
													Reversal Journal Entry ID <span className="font-bold">{journal.reverseJournalEntryId}</span>
												</span>
											</>
										)}
									</div>
									<p className="text-[13px] text-[#808080]">{journal.description || "-"}</p>
								</div>
							</div>

							{/* Summary detail cards */}
							<div className="grid grid-cols-3 gap-4">
								<DetailCard
									label={t("admin.transactions.total-debit")}
									value={
										<span className="inline-flex items-center gap-2">
											<Icon className="h-5 w-5" name="Riyal" />
											<span>{formatCurrency(totalDebit, true) || "0.00"}</span>
										</span>
									}
								/>
								<DetailCard
									label={t("admin.transactions.total-credit")}
									value={
										<span className="inline-flex items-center gap-2">
											<Icon className="h-5 w-5" name="Riyal" />
											<span>{formatCurrency(totalCredit, true) || "0.00"}</span>
										</span>
									}
								/>
								<DetailCard
									label={t("admin.transactions.no-source-collections")}
									value={isLoadingCollections ? "…" : totalCollectionsCount}
								/>
							</div>

							{/* From/To accounts + collector/financier */}
						{/* 	<div className="grid grid-cols-4 gap-4">
								<DetailCard label="From Account" value={journal.fromAccount ?? "-"} />
								<DetailCard label="To Account" value={journal.toAccount ?? "-"} />
								<DetailCard label="Collector" value={journal.collectorFacilityName || "-"} />
								<DetailCard label="Financier" value={journal.financierFacilityName || "-"} />
							</div> */}

							{isReversal && (
								<div className="rounded-lg bg-[#FCE8E6] px-4 py-2 text-sm font-medium text-[#C0392B]">
									{journal.status === "reverse_created"
										? "Reversal in progress — waiting for the reversal journal entry to be posted."
										: "This entry was reversed."}
								</div>
							)}
						</div>

						{/* Accounting lines */}
						<div className="flex flex-col gap-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-[#808080]">
								{t("admin.transactions.accounting-lines")}
							</p>
							<div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
											<th className="py-3 pl-6 pr-4">{t("admin.transactions.line-number")}</th>
											<th className="px-4 py-3">{t("admin.transactions.account-id")}</th>
											<th className="px-4 py-3 text-right [&>div]:inline-flex">
												<RiyalTitle>{t("admin.transactions.debit-amount")}</RiyalTitle>
											</th>
											<th className="px-4 py-3 text-right [&>div]:inline-flex">
												<RiyalTitle>{t("admin.transactions.credit-amount")}</RiyalTitle>
											</th>
											<th className="px-4 py-3">{t("admin.transactions.description")}</th>
										</tr>
									</thead>
									<tbody>
										{lines.map(line => (
											<tr key={line.id} className="border-b bg-white text-sm last:border-0">
												<td className="py-3 pl-6 pr-4 text-gray-400">{line.lineNumber}</td>
												<td className="px-4 py-3 font-mono text-gray-700">{line.accountId}</td>
												<td className="px-4 py-3 text-right font-medium text-red-600">
													{(line.debitAmount ?? 0) > 0 ? (
														<FormattedNumber value={line.debitAmount!} />
													) : (
														<span className="text-gray-300">—</span>
													)}
												</td>
												<td className="px-4 py-3 text-right font-medium text-green-600">
													{(line.creditAmount ?? 0) > 0 ? (
														<FormattedNumber value={line.creditAmount!} />
													) : (
														<span className="text-gray-300">—</span>
													)}
												</td>
												<td className="px-4 py-3 text-gray-600">{line.description}</td>
											</tr>
										))}
										{!isLoadingLines && lines.length === 0 && (
											<tr>
												<td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
													{t("admin.transactions.no-accounting-lines")}
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>

						{/* Source collections */}
						<div className="flex flex-col gap-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-[#808080]">
								{t("admin.transactions.source-collections")}
							</p>
							{isLoadingCollections ? (
								<div className="rounded-xl border border-gray-100 bg-white py-6 text-center text-sm text-gray-400">
									{t("global.loading")}
								</div>
							) : (
								<div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
												<th className="py-3 pl-6 pr-4">{t("admin.transactions.invoice-ref")}</th>
												<th className="px-4 py-3">{t("admin.transactions.collection-ref")}</th>
												<th className="px-4 py-3">{t("admin.transactions.type")}</th>
												<th className="px-4 py-3">{t("admin.transactions.period")}</th>
												<th className="px-4 py-3">{t("admin.invoices.Eligible At")}</th>
												<th className="px-4 py-3 text-right [&>div]:inline-flex">
													<RiyalTitle>{isReversal ? t("admin.collection-advice.reversed-amount"): t("admin.invoices.applied-amount")}</RiyalTitle>
												</th>
												<th className="px-4 py-3">{t("admin.transactions.status")}</th>
											</tr>
										</thead>
										<tbody>
											{collections.map(col => (
												<tr key={col.id} className="border-b bg-white text-sm last:border-0">
													<td className="py-3 pl-6 pr-4 font-mono text-gray-700">{col.invoiceReference || "-"}</td>
													<td className="px-4 py-3 font-mono text-gray-700">
														{col.collectorCollectionReference || "-"}
													</td>
													<td className="px-4 py-3 text-gray-600">{col.type || "-"}</td>
													<td className="px-4 py-3 text-gray-600">
														{col.month && col.year ? `${col.month}/${col.year}` : "-"}
													</td>
													<td className="px-4 py-3 text-gray-600">
														{col.eligibleAt ? dayjs(col.eligibleAt).format("DD MMM YYYY") : "-"}
													</td>
													<td className="px-4 py-3 text-right font-medium text-gray-800">
														<FormattedNumber
															value={isReversal ? (col.lastReversedAmount ?? 0) : col.lastAppliedAmount}
														/>
													</td>
													<td className="px-4 py-3">
														<CollectionStatusPill collection={col} />
													</td>
												</tr>
											))}
											{!collections.length && (
												<tr>
													<td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">
														{t("admin.transactions.no-source-collections")}
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							)}

							{!isLoadingCollections && totalCollectionsCount > 0 && (
								<Pagination
									currentCount={collections.length}
									page={collectionsPage}
									perPage={collectionsPerPage}
									totalCount={totalCollectionsCount}
									setPage={setCollectionsPage}
									setPerPage={size => {
										setCollectionsPerPage(size);
										setCollectionsPage(1);
									}}
									pageSizeOptions={config.PAYMENT_TRANSACTION_PAGE_SIZE_OPTIONS}
									showing
								/>
							)}
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

function ReverseConfirmDialog({
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
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.transactions.reverse") || "Reverse"}</h2>
							<p className="mt-4 text-lg text-gray-700">
								{t("admin.transactions.confirm-reverse") ||
									"Reverse this payment transaction? This will reinstate the source collections and post a mirrored reversal journal entry."}
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
							{t("admin.transactions.reverse") || "Reverse"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function PaymentTransactionPanel({
	buyerId,
	salesOrderId,
	invoiceId,
	batchId,
	hideSummary,
	hideReverse,
}: PaymentTransactionPanelProps) {
	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [selectedJournal, setSelectedJournal] = useState<IPaymentTransactionJournal | null>(null);
	const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
	const [reversingId, setReversingId] = useState<number | null>(null);
	const [confirmReverseTx, setConfirmReverseTx] = useState<IPaymentTransaction | null>(null);

	const { data, isLoading } = useFetchPaymentTransactionsList(
		{ batchId, buyerId, invoiceId, limit: perPage, page, salesOrderId },
		{ gcTime: 0, staleTime: 0 },
	);

	const transactions: IPaymentTransaction[] = (data?.paymentTransactions ?? [])
		.filter(pt => pt.status !== "reversed")
		.slice()
		.sort((a, b) => b.id - a.id);
	const totalCount = data?.totalCount ?? transactions.length;
	const totalJournals = data?.totalJournals ?? 0;
	const totalPaid = data?.totalPaid ?? 0;

	const { mutate: reverseMutate } = useReversePaymentTransaction({
		onError: (err: any) => {
			toast({
				description: err.response?.data?.message || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
			setReversingId(null);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "collections"] });
			queryClient.invalidateQueries({ queryKey: ["back-office", "invoices"] });
			toast({
				description: t("admin.transactions.reverse-success") || "Payment transaction reversed successfully",
				title: t("admin.common.success"),
				variant: "destructive",
			});
			setReversingId(null);
		},
	});

	const toggleExpand = (id: number) => {
		setExpandedIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleReverse = (e: React.MouseEvent, pt: IPaymentTransaction) => {
		e.stopPropagation();
		if (pt.status === "reversed") return;
		setConfirmReverseTx(pt);
	};

	const confirmReverse = () => {
		if (!confirmReverseTx) return;
		setReversingId(confirmReverseTx.id);
		reverseMutate(confirmReverseTx.id);
		setConfirmReverseTx(null);
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Summary strip */}
			{!hideSummary && (
				<div className="grid grid-cols-3 gap-3">
					<DetailCard
						label={t("admin.transactions.total-paid")}
						value={
							<span className="inline-flex items-center gap-2">
								<Icon className="h-5 w-5" name="Riyal" />
								<span>{formatCurrency(totalPaid, true) || "0.00"}</span>
							</span>
						}
					/>
					<DetailCard label={t("admin.transactions.payment-transactions") || "Payment Transactions"} value={totalCount} />
					<DetailCard label={t("admin.transactions.journal-entries")} value={totalJournals} />
				</div>
			)}

			{/* Table */}
			<div className="flex overflow-hidden rounded-xl border border-gray-100">
				<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
				<div className="flex-1">
					{isLoading ? (
						<div className="px-4 py-8 text-center text-sm text-gray-400">
							{t("admin.transactions.loading-payment-history")}
						</div>
					) : (
						<table className="w-full">
							<thead>
								<tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
									<th className="w-10 py-3 pl-6 pr-2" />
									<th className="px-2 py-3">{t("admin.transactions.payment-transaction-id") || "Payment Transaction ID"}</th>
									<th className="px-4 py-3">{t("admin.transactions.payment-date") || "Payment Date"}</th>
									<th className="px-4 py-3">{t("admin.transactions.batch-id") || "Batch ID"}</th>
									<th className="px-4 py-3">{t("admin.transactions.type") || "Type"}</th>
									<th className="px-4 py-3 text-right [&>div]:inline-flex">
										<RiyalTitle>{t("admin.invoices.amount")}</RiyalTitle>
									</th>

									{/* Created At / Updated At columns hidden per request */}
									{/* <th className="px-4 py-3">{t("admin.transactions.created-at") || "Created At"}</th> */}
									{/* <th className="px-4 py-3">{t("admin.transactions.created-by") || "Created By"}</th> */}
									{<th className="px-4 py-3">{t("admin.transactions.updated-at") || "Updated At"}</th> }
									<th className="px-4 py-3">{t("admin.transactions.updated-by") || "Updated By"}</th>
									<th className="px-4 py-3">{t("admin.transactions.transaction-status")}</th>
								</tr>
							</thead>
							<tbody>
								{transactions.map(pt => {
									const isExpanded = expandedIds.has(pt.id);
									const ptAmount = pt.journals.reduce(
										(s, j) => s + (REVERSAL_STATUSES.includes(j.status) ? 0 : j.amount || 0),
										0,
									);
									const canReverse =
										!hideReverse &&
											pt.type !== "upload" &&
											pt.status !== "reversed" &&
											pt.journals.some(j => j.status === "posted");
									const firstJournal = pt.journals.find(j => j.status !== "reversed");
									const paymentDateJournalId =
										firstJournal?.journalEntryId ?? firstJournal?.reverseJournalEntryId ?? undefined;

									return (
										<Fragment key={pt.id}>
											<tr
												className="cursor-pointer border-b border-[#CFE3F3] bg-[#EAF4FB] text-sm hover:bg-[#DCEBF8]"
												onClick={() => toggleExpand(pt.id)}
											>
												<td className="py-3 pl-6 pr-2 text-right">
													<ChevronDown
														className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
													/>
												</td>
												<td className="px-2 py-3">{pt.id}</td>
												<td className="px-4 py-3 text-gray-600">
													<PaymentDateCell journalId={paymentDateJournalId} />
												</td>
												<td className="px-4 py-3">
													{pt.batchId || "-"}
												</td>
												<td className="px-4 py-3 text-gray-600">{pt.type || "-"}</td>
												<td className="px-4 py-3 text-right">
													<FormattedNumber value={ptAmount} />
												</td>

												{/* Created At / Updated At columns hidden per request */}
												{/* <td className="px-4 py-3 text-gray-600">
													{pt.createdAt ? dayjs(pt.createdAt).format("DD MMM, YYYY") : "-"}
												</td> */}
												{/* <td className="px-4 py-3 text-gray-600">{pt.createdByName || pt.createdBy || "-"}</td> */}
												{ <td className="px-4 py-3 text-gray-600">
													{pt.updatedAt ? dayjs(pt.updatedAt).format("DD MMM, YYYY") : "-"}
												</td> }
												<td className="px-4 py-3 text-gray-600">{pt.updatedByName || pt.updatedBy || "-"}</td>
												<td className="px-4 py-3">
													{canReverse ? (
														<Button
															disabled={reversingId === pt.id}
															loading={reversingId === pt.id}
															size="sm"
															variant="outline"
															onClick={e => handleReverse(e, pt)}
														>
															{t("admin.transactions.reverse") || "Reverse"}
														</Button>
													) : (
														<StatusPill status={pt.status} />
													)}
												</td>
											</tr>
											{isExpanded && (
												<tr className="bg-white">
													<td colSpan={9} className="p-0">
														<table className="w-full bg-white">
															<thead>
																<tr className="border-b text-left text-sm font-medium text-gray-500">
																	<th className="py-2 pl-24 pr-4">
																		{t("admin.transactions.journal-entry-id") || "Journal Entry ID"}
																	</th>
																	<th className="px-2 py-2">{t("admin.transactions.reference-number")}</th>
																	<th className="px-2 py-2">{t("admin.transactions.from") || "From"}</th>
																	<th className="px-2 py-2">{t("admin.transactions.to") || "To"}</th>
																	<th className="px-2 py-2 text-right [&>div]:inline-flex">
																		<RiyalTitle>{t("admin.invoices.amount")}</RiyalTitle>
																	</th>
																	<th className="px-2 py-2">{t("admin.transactions.status")}</th>
																	{/* <th className="px-2 py-2">{t("admin.transactions.created-at") || "Created At"}</th> */}
																	{/* <th className="px-2 py-2">{t("admin.transactions.created-by") || "Created By"}</th> */}
																	{ <th className="px-2 py-2">{t("admin.transactions.updated-at") || "Updated At"}</th> }
																	<th className="px-2 py-2">{t("admin.transactions.updated-by") || "Updated By"}</th>
																</tr>
															</thead>
															<tbody>
																{pt.journals.filter(journal => journal.status !== "reversed").map(journal => (
																	<tr
																		key={journal.id}
																		className="cursor-pointer border-b bg-white text-sm hover:bg-gray-50 last:border-b-0"
																		onClick={() => setSelectedJournal(journal)}
																	>
																		<td className="py-2 pl-24 pr-4">{journal.journalEntryId ?? journal.reverseJournalEntryId}</td>
																		<td className="px-2 py-2 font-mono text-xs text-gray-600">
																			{journal.referenceNumber || "-"}
																		</td>
																		<td className="px-2 py-2 text-gray-600">
																			{journal.collectorFacilityName || "-"}
																		</td>
																		<td className="px-2 py-2 text-gray-600">
																			{journal.financierFacilityName || "-"}
																		</td>
																		<td className="px-2 py-2 text-right">
																			<FormattedNumber
																				value={
																					journal.status === "reverse_created" || journal.status === "reversed"
																						? -(journal.amount || 0)
																						: journal.amount
																				}
																			/>
																		</td>
																		<td className="px-2 py-2">
																			<StatusPill status={journal.status} />
																		</td>
																		{/* <td className="px-2 py-2 text-gray-600">
																			{journal.createdAt ? dayjs(journal.createdAt).format("DD MMM, YYYY") : "-"}
																		</td> */}
																		{/* <td className="px-2 py-2 text-gray-600">{journal.createdByName || journal.createdBy || "-"}</td> */}
																		 <td className="px-2 py-2 text-gray-600">
																			{journal.updatedAt ? dayjs(journal.updatedAt).format("DD MMM, YYYY") : "-"}
																		</td> 
																		<td className="px-2 py-2 text-gray-600">{journal.updatedByName || journal.updatedBy || "-"}</td>
																	</tr>
																))}
																{pt.journals.filter(journal => journal.status !== "reversed").length === 0 && (
																	<tr>
																		<td colSpan={9} className="px-4 py-4 text-center text-sm text-gray-400">
																			{t("global.no-data-found")}
																		</td>
																	</tr>
																)}
															</tbody>
														</table>
													</td>
												</tr>
											)}
										</Fragment>
									);
								})}
								{transactions.length === 0 && (
									<tr>
										<td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">
											{t("global.no-data-found")}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					)}
				</div>
			</div>

			<Pagination
				currentCount={transactions.length}
				page={page}
				perPage={perPage}
				totalCount={totalCount}
				setPage={setPage}
				setPerPage={size => {
					setPerPage(size);
					setPage(1);
				}}
				showing
			/>

			<JournalDialog journal={selectedJournal} open={!!selectedJournal} onClose={() => setSelectedJournal(null)} />

			<ReverseConfirmDialog
				open={!!confirmReverseTx}
				isPending={reversingId === confirmReverseTx?.id}
				onClose={() => setConfirmReverseTx(null)}
				onConfirm={confirmReverse}
			/>
		</div>
	);
}
