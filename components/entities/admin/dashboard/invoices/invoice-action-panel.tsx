"use client";

//new branch created dummy

import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { IInvoiceAction, useFetchInvoiceActions } from "@/api/endpoints/back-office/invoices/fetch-invoice-actions";
import { FormattedNumber } from "@/components/global/formatted-number";
import { RiyalTitle } from "@/components/global/riyal-title";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";

function statusPillColors(status: string) {
	const normalized = (status || "").toLowerCase();
	if (normalized === "reversed") return { color: "#C0392B", dot: "#C0392B" };
	if (normalized === "posted") return { color: "#38A06C", dot: "#38A06C" };
	return { color: "#C97A1F", dot: "#C97A1F" };
}

function StatusPill({ status }: { status: string }) {
	const { color, dot } = statusPillColors(status);
	return (
		<div className="inline-flex items-center gap-2 rounded-lg px-2 py-1" style={{ backgroundColor: `${color}1A`, color }}>
			<div className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
			<span className="font-light">{status || "-"}</span>
		</div>
	);
}

interface InvoiceActionPanelProps {
	invoiceId: number;
	buyerId?: number;
	salesOrderId?: number;
	salesOrderRef?: string | null;
}

export function InvoiceActionPanel({ invoiceId, buyerId, salesOrderId, salesOrderRef }: InvoiceActionPanelProps) {
	const { t } = useTranslationContext();
	const router = useRouter();
	const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
	const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

	const { data: actionsData } = useFetchInvoiceActions(invoiceId, { gcTime: 0, staleTime: 0 }, actionTypeFilter);
	const actions: IInvoiceAction[] = actionsData?.actions ?? [];

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

	const goToJournalEntry = (journalEntryId: number, actionDate?: string) => {
		const params = new URLSearchParams({
			from: "invoice",
			...(buyerId ? { buyerId: String(buyerId) } : {}),
			invoiceId: String(invoiceId),
			...(salesOrderId ? { salesOrderId: String(salesOrderId) } : {}),
			...(salesOrderRef ? { salesOrderRef } : {}),
			...(actionDate ? { actionDate } : {}),
		});
		router.push(`${config.PATHS.dashboard.ADMIN.transaction(journalEntryId)}?${params}`);
	};

	return (
		<>
			<div className="flex items-center gap-2">
				<Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder={t("admin.common.invoice-action")} />
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
								<th className="px-4 py-3">{t("admin.common.type")}</th>
								<th className="px-4 py-3">{t("admin.invoices.invoice-reference")}</th>
								<th className="px-4 py-3 text-right [&>div]:inline-flex">
									<RiyalTitle>{t("admin.invoices.delivery-amount")}</RiyalTitle>
								</th>
								<th className="px-4 py-3">{t("admin.invoices.is-final")}</th>
								<th className="px-4 py-3">{t("admin.common.action-by")}</th>
							</tr>
						</thead>
						<tbody>
							{actions.map((action: IInvoiceAction) => {
								const isExpanded = expandedIds.has(action.actionId);
								const visibleEntries = action.type === "update"
									? action.journalEntries.filter(je => (je.referenceNumber || "").toLowerCase().startsWith("soclsso"))
									: action.journalEntries;
								const hasJournalEntries = visibleEntries.length > 0;
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
											<td className="px-4 py-3 text-right">
												<FormattedNumber value={Number(action.deliveryAmount ?? 0)} />
											</td>
											<td className="px-4 py-3 text-gray-600">{String(action.isFinal ?? "-")}</td>
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
																{/* <th className="px-2 py-2">{t("admin.transactions.status")}</th> */}
																<th className="px-2 py-2">{t("admin.transactions.description")}</th>
															</tr>
														</thead>
														<tbody>
															{(action.type === "update" ? action.journalEntries.filter(je => (je.referenceNumber || "").toLowerCase().startsWith("soclsso")) : action.journalEntries).map(journalEntry => (
																<tr
																	key={journalEntry.id}
																	className="cursor-pointer border-b bg-white text-sm hover:bg-gray-50 last:border-b-0"
																	onClick={() => goToJournalEntry(journalEntry.id, action.actionDate)}
																>
																	<td className="py-2 pl-24 pr-4">{journalEntry.id}</td>
																	<td className="px-2 py-2 font-mono text-xs text-gray-600">
																		{journalEntry.referenceNumber || "-"}
																	</td>
																	<td className="px-2 py-2 text-gray-600">
																		{journalEntry.date ? dayjs(journalEntry.date).format("DD MMM, YYYY") : "-"}
																	</td>
																	{/* <td className="px-2 py-2">
																		<StatusPill status={journalEntry.status ?? ""} />
																	</td> */}
																	<td className="px-2 py-2 text-gray-600">{journalEntry.description || "-"}</td>
																</tr>
															))}
															{(action.type === "update" ? action.journalEntries.filter(je => (je.referenceNumber || "").toLowerCase().startsWith("soclsso")) : action.journalEntries).length === 0 && (
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
