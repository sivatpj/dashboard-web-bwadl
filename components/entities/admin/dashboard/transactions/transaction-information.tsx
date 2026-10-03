import dayjs from "dayjs";
import { IJournalEntry } from "@/api/types";
import { FormattedNumber } from "@/components/global/formatted-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useTranslationContext } from "@/contexts/translation";

type TransactionInformationProps = IJournalEntry;

export const TransactionInformation = (props: TransactionInformationProps) => {
	const {
		referenceNumber,
		status,
		date,
		description,
		currencyCode,
		lines,
		createdAt,
		updatedAt,
		createdBy,
		updatedBy,
		invoiceAmount,
		deliveryAmount,
	} = props;

	const { t } = useTranslationContext();

	const totalDebit = lines?.reduce((sum, line) => sum + (line.debitAmount || 0), 0) || 0;
	const totalCredit = lines?.reduce((sum, line) => sum + (line.creditAmount || 0), 0) || 0;

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardHeader>
					<CardTitle>{t("admin.transactions.transaction-details")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-6">
						<div>
							<p className="text-sm text-muted-foreground">{t("admin.transactions.reference-number")}</p>
							<p className="font-medium">{referenceNumber}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t("admin.transactions.status")}</p>
							<p className="font-medium">{status}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t("admin.transactions.date")}</p>
							<p className="font-medium">{date ? dayjs(date).format("DD/MM/YYYY") : "-"}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t("admin.transactions.currency")}</p>
							<p className="font-medium">{currencyCode}</p>
						</div>
						<div className="col-span-2">
							<p className="text-sm text-muted-foreground">{t("admin.transactions.description")}</p>
							<p className="font-medium">{description}</p>
						</div>
					{/* 	<div>
							<p className="text-sm text-muted-foreground">{t("admin.transactions.invoice-amount")}</p>
							<p className="font-medium">
								<FormattedNumber value={invoiceAmount} />
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t("admin.transactions.delivery-amount")}</p>
							<p className="font-medium">
								<FormattedNumber value={deliveryAmount} />
							</p>
						</div> */}
						<div>
							<p className="text-sm text-muted-foreground">{t("admin.transactions.created-at")}</p>
							<p className="font-medium">{createdAt ? dayjs(createdAt).format("DD/MM/YYYY HH:mm") : "-"}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">{t("admin.transactions.updated-at")}</p>
							<p className="font-medium">{updatedAt ? dayjs(updatedAt).format("DD/MM/YYYY HH:mm") : "-"}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("admin.transactions.transaction-lines")}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex overflow-hidden rounded-xl border border-gray-100">
						<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
						<DataTable
							className="flex-1"
							data={lines}
							headers={[
								{
									key: "lineNumber",
									label: t("admin.transactions.line-number"),
								},
								{
									key: "accountId",
									label: t("admin.transactions.account-id"),
								},
								{
									key: "description",
									label: t("admin.transactions.description"),
								},
								{
									alignment: "right",
									key: "debitAmount",
									label: t("admin.transactions.debit-amount"),
									render: value => <FormattedNumber value={value} />,
								},
								{
									alignment: "right",
									key: "creditAmount",
									label: t("admin.transactions.credit-amount"),
									render: value => <FormattedNumber value={value} />,
								},
							]}
							loading={false}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
