import { IInvoice } from "@/api/types";
import { useTranslationContext } from "@/contexts/translation";

interface InvoiceStatusPillProps {
	status: IInvoice["status"] | "Completed" | "Confirm Delivery";
}

export const InvoiceStatusPill = (props: InvoiceStatusPillProps) => {
	const { status } = props;

	const { t } = useTranslationContext();

	if (status === "Confirm Delivery") {
		return (
			<span className="inline-flex items-center rounded-full bg-[#404040] px-3 py-1 text-xs font-medium text-white">
				{t("admin.sales-orders.confirm-delivery")}
			</span>
		);
	}

	const stylesMap = new Map<typeof status | "Unknown", { bg: string; text: string }>([
		["Paid", { bg: "#E1FCEF", text: "#38A06C" }],
		["Completed", { bg: "#E1FCEF", text: "#38A06C" }],
		["Cancelled", { bg: "#E9EDF5", text: "#687181" }],
		["Ongoing", { bg: "#FCF2E6", text: "#C97A1F" }],
		["Overdue", { bg: "#FFEBEE", text: "#D32F2F" }],
		["Partially Paid", { bg: "#E3F2FD", text: "#1976D2" }],
		["Unknown", { bg: "#F0F0F0", text: "#000000" }],
	]);

	const styles = stylesMap.get(status || "Unknown")!;

	return (
		<div
			className="inline-flex items-center gap-2 rounded-lg px-2 py-1"
			style={{ backgroundColor: styles.bg, color: styles.text }}
		>
			<div className="h-2 w-2 rounded-full" style={{ backgroundColor: styles.text }} />
			<span className="font-light">{t(`admin.common.invoice-status-enum.${status || "Unknown"}`)}</span>
		</div>
	);
};
