"use client";

import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { useFetchTransactionById } from "@/api/endpoints/back-office/transactions/fetch-transactions";
import {
	ISalesOrderAction,
	useFetchSalesOrderActions,
} from "@/api/endpoints/back-office/sales-orders/fetch-sales-order-actions";
import { FormattedNumber } from "@/components/global/formatted-number";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";

interface GroupedSalesOrderAction extends ISalesOrderAction {
	journalEntryIds: number[];
}

function groupActionsByActionId(actions: ISalesOrderAction[]): GroupedSalesOrderAction[] {
	const byActionId = new Map<number, GroupedSalesOrderAction>();

	// actions come back unfiltered (every version), ordered ascending by v inside the same actionId
	// since the table is versioned and each version backfills the journal entry id it produced.
	for (const action of [...actions].sort((a, b) => a.actionId - b.actionId || a.v - b.v)) {
		const existing = byActionId.get(action.actionId);
		if (!existing) {
			byActionId.set(action.actionId, {
				...action,
				journalEntryIds: action.journalEntryId ? [action.journalEntryId] : [],
			});
		} else if (action.journalEntryId && !existing.journalEntryIds.includes(action.journalEntryId)) {
			existing.journalEntryIds.push(action.journalEntryId);
		}
	}

	return [...byActionId.values()].sort((a, b) => (a.actionDate < b.actionDate ? 1 : a.actionDate > b.actionDate ? -1 : 0));
}

function JournalEntryRow({
	journalEntryId,
	onClick,
}: {
	journalEntryId: number;
	onClick: (journalEntryId: number) => void;
}) {
	const { t } = useTranslationContext();
	const { data } = useFetchTransactionById(journalEntryId);
	const journalEntry = data?.journalEntry;


	return (
		<tr
			className="cursor-pointer border-b bg-white text-sm hover:bg-gray-50 last:border-b-0"
			onClick={() => onClick(journalEntryId)}
		>
			<td className="py-2 pl-24 pr-4">{journalEntryId}</td>
			<td className="px-2 py-2 font-mono text-xs text-gray-600">{journalEntry?.referenceNumber || "-"}</td>
			<td className="px-2 py-2 text-gray-600">
				{journalEntry?.date ? dayjs(journalEntry.date).format("DD MMM, YYYY") : "-"}
			</td>
			<td className="px-2 py-2 text-gray-600">{journalEntry?.description || t("global.loading") || "-"}</td>
		</tr>
	);
}

interface SalesOrderActionPanelProps {
	salesOrderId: number;
	buyerId?: number;
	salesOrderRef?: string | null;
}

export function SalesOrderActionPanel({ salesOrderId, buyerId, salesOrderRef }: SalesOrderActionPanelProps) {
	const { t } = useTranslationContext();
	const router = useRouter();
	const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
	const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

	const { data: actionsData } = useFetchSalesOrderActions(salesOrderId, { gcTime: 0, staleTime: 0 }, actionTypeFilter);

	const actions = useMemo(() => groupActionsByActionId(actionsData?.actions ?? []), [actionsData]);

	const toggleExpand = (actionId: number) => {
		setExpandedIds(prev => {
			const next = new Set(prev);
			if (next.has(actionId)) {
				next.delete(actionId);
			} else {
				next.add(actionId);
			}
			return next;
		});
	};

	const goToJournalEntry = (journalEntryId: number) => {
		const params = new URLSearchParams({
			from: "sales-order",
			...(buyerId ? { buyerId: String(buyerId) } : {}),
			salesOrderId: String(salesOrderId),
			...(salesOrderRef ? { salesOrderRef } : {}),
		});
		router.push(`${config.PATHS.dashboard.ADMIN.transaction(journalEntryId)}?${params}`);
	};

	return (
		<>
			<div className="flex items-center gap-2">
				<Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder={t("admin.common.sales-order-action")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("admin.common.all")}</SelectItem>
						<SelectItem value="create">Create</SelectItem>
						<SelectItem value="update">Update</SelectItem>
						<SelectItem value="cancel">Cancel</SelectItem>
						<SelectItem value="Delete">Delete</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex overflow-hidden rounded-xl border border-gray-100">
				<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
				<div className="flex-1">
					<table className="w-full">
						<thead>
							<tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
								<th className="w-10 py-3 pl-6 pr-2" />
								<th className="px-2 py-3">{t("admin.common.date")}</th>
								<th className="px-4 py-3">{t("admin.common.sales-order-action")}</th>
								<th className="px-4 py-3">{t("admin.sales-orders.reference")}</th>
								<th className="px-4 py-3">{t("admin.common.is-closed")}</th>
								<th className="px-4 py-3 text-right">{t("admin.sales-orders.amount")}</th>
								<th className="px-4 py-3">{t("admin.common.action-by")}</th>
							</tr>
						</thead>
						<tbody>
							{actions.map(action => {
								const isExpanded = expandedIds.has(action.actionId);
								const hasJournalEntries = action.journalEntryIds.length > 0;
								return (
									<Fragment key={action.actionId}>
										<tr
											className={`border-b border-[#CFE3F3] bg-[#EAF4FB] text-sm ${hasJournalEntries ? "cursor-pointer hover:bg-[#DCEBF8]" : "cursor-default"}`}
											onClick={() => hasJournalEntries && toggleExpand(action.actionId)}
										>
											<td className="py-3 pl-6 pr-2 text-right">
												<ChevronDown
													className={`h-4 w-4 transition-transform ${hasJournalEntries ? "text-gray-400" : "text-gray-200"} ${isExpanded ? "rotate-180" : ""}`}
												/>
											</td>
											<td className="px-2 py-3 text-gray-600">
												{action.actionDate ? dayjs(action.actionDate).format("DD/MM/YYYY HH:mm") : "-"}
											</td>
											<td className="px-4 py-3 text-gray-600">{action.type}</td>
											<td className="px-4 py-3 text-gray-600">{action.reference}</td>
											<td className="px-4 py-3 text-gray-600">
												{action.isClosed ? t("admin.sales-orders.yes") : t("admin.sales-orders.no")}
											</td>
											<td className="px-4 py-3 text-right">
												<FormattedNumber value={Number(action.amount ?? 0)} />
											</td>
											<td className="px-4 py-3 text-gray-600">
												{action.actionBy?.nameEn || action.actionBy?.email || "-"}
											</td>
										</tr>
										{isExpanded && (
											<tr className="bg-white">
												<td colSpan={7} className="p-0">
													<table className="w-full bg-white">
														<thead>
															<tr className="border-b text-left text-sm font-medium text-gray-500">
																<th className="py-2 pl-24 pr-4">
																	{t("admin.transactions.journal-entry-id") || "Journal Entry ID"}
																</th>
																<th className="px-2 py-2">{t("admin.transactions.reference-number")}</th>
																<th className="px-2 py-2">{t("admin.transactions.date")}</th>
																<th className="px-2 py-2">{t("admin.transactions.description")}</th>
															</tr>
														</thead>
														<tbody>
															{action.journalEntryIds.map(journalEntryId => (
																<JournalEntryRow
																	key={journalEntryId}
																	journalEntryId={journalEntryId}
																	onClick={goToJournalEntry}
																/>
															))}
															{action.journalEntryIds.length === 0 && (
																<tr>
																	<td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-400">
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
							{actions.length === 0 && (
								<tr>
									<td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
										{t("global.no-data-found")}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}
