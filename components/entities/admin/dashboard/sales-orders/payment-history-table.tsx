"use client";

import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import type { ICollection } from "@/api/types";
import { CollectionStatusPill } from "@/components/entities/admin/dashboard/invoices/collection-status-pill";
import { FormattedNumber } from "@/components/global/formatted-number";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { cn } from "@/lib/utils";

interface PaymentHistoryRow {
	amount: number;
	date?: string | null;
	displayReference?: string;
	id: string;
	installmentIds?: number[];
	reference: string;
	registeredBy: string;
	status: string;
}

type PaymentInstallmentRow = ICollection & {
	invoiceReference: string;
};

interface PaymentHistoryTableProps {
	buyerId: number;
	installments: PaymentInstallmentRow[];
	payments: PaymentHistoryRow[];
}

export function PaymentHistoryTable({ buyerId, installments, payments }: PaymentHistoryTableProps) {
	const router = useRouter();
	const { t } = useTranslationContext();
	const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set());

	const togglePayment = (paymentId: string) => {
		setExpandedPayments(prev => {
			const next = new Set(prev);
			if (next.has(paymentId)) {
				next.delete(paymentId);
			} else {
				next.add(paymentId);
			}
			return next;
		});
	};

	return (
		<div className="flex overflow-hidden rounded-xl border border-gray-100">
			<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
			<div className="flex-1">
				<table className="w-full">
					<thead>
						<tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
							<th className="py-3 pl-6 pr-4">{t("admin.transactions.transaction-id")}</th>
							<th className="px-8 py-3 text-right [&>div]:inline-flex">
								<RiyalTitle>{t("admin.invoices.amount")}</RiyalTitle>
							</th>
							<th className="px-4 py-3">{t("admin.transactions.payment-date")}</th>
							<th className="px-4 py-3">{t("admin.transactions.registered-by")}</th>
							<th className="px-4 py-3">{t("admin.transactions.transaction-status")}</th>
							<th className="w-10 px-4 py-3 text-center" />
						</tr>
					</thead>
					<tbody>
						{payments.map(payment => {
							const isExpanded = expandedPayments.has(payment.id);
							const relatedInstallments = installments.filter(
								installment =>
									installment.appliedAmount > 0 &&
									(payment.installmentIds?.includes(installment.id) ||
										installment.appliedOnPaymentReference === payment.reference ||
										installment.subAccountPaymentReference === payment.reference ||
										(!installment.appliedOnPaymentReference &&
											!installment.subAccountPaymentReference &&
											installment.invoiceReference === payment.reference)),
							);

							return (
								<Fragment key={payment.id}>
									<tr
										className="cursor-pointer border-b bg-white text-sm hover:bg-gray-50"
										onClick={() => togglePayment(payment.id)}
									>
										<td className="py-3 pl-6 pr-4">{payment.displayReference || payment.reference}</td>
										<td className="px-8 py-3 text-right">
											<FormattedNumber value={payment.amount} />
										</td>
										<td className="px-4 py-3">{payment.date ? dayjs(payment.date).format("DD/MM/YYYY") : "-"}</td>
										<td className="px-4 py-3">{payment.registeredBy}</td>
										<td className="px-4 py-3">
											<div
												className="inline-flex items-center gap-2 rounded-lg px-2 py-1"
												style={{ backgroundColor: "#E1FCEF", color: "#38A06C" }}
											>
												<div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#38A06C" }} />
												<span className="font-light">{payment.status}</span>
											</div>
										</td>
										<td className="px-4 py-3 text-center">
											<ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
										</td>
									</tr>
									{isExpanded && (
										<tr className="bg-transparent">
											<td colSpan={6} className="bg-transparent px-8 py-4">
												{relatedInstallments.length > 0 ? (
													<DataTable<PaymentInstallmentRow>
														className="ml-auto w-full max-w-[1300px]"
														data={relatedInstallments}
														headers={[
															{
																key: "invoiceReference",
																label: t("admin.sales-orders.invoice-number"),
															},
															{
																key: "collectorCollectionReference",
																label: t("admin.sales-orders.installment-number"),
															},
															{
																alignment: "right",
																key: "appliedAmount",
																label: <RiyalTitle>{t("admin.invoices.amount")}</RiyalTitle>,
																render: value => <FormattedNumber value={value} />,
															},
															{
																label: t("admin.sales-orders.installment-status"),
																render: (_value, installment) => <CollectionStatusPill collection={installment} />,
															},
														]}
														onClick={row => router.push(config.PATHS.dashboard.ADMIN.invoice(row.invoiceId, buyerId))}
														onOpen={row => router.push(config.PATHS.dashboard.ADMIN.invoice(row.invoiceId, buyerId))}
													/>
												) : (
													<div className="ml-auto w-full max-w-[1300px] rounded-md bg-white px-4 py-4 text-center text-sm text-gray-400">
														{t("global.no-data-found")}
													</div>
												)}
											</td>
										</tr>
									)}
								</Fragment>
							);
						})}
						{payments.length === 0 && (
							<tr>
								<td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-400">
									{t("global.no-data-found")}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
