import { useTranslationContext } from "@/contexts/translation";

type OrderStatus = "Paid" | "Cancelled" | "Ongoing" | "Overdue" | "Partially Paid" | "Completed" | "Unknown";

interface OrderStatusPillProps {
	status: OrderStatus;
}

export const OrderStatusPill = (props: OrderStatusPillProps) => {
	const { status } = props;

	const { t } = useTranslationContext();

	const stylesMap = new Map<OrderStatus, { bg: string; text: string }>([
		["Completed", { bg: "#E1FCEF", text: "#38A06C" }],
		["Paid", { bg: "#E1FCEF", text: "#38A06C" }],
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
			<span className="font-light">{t(`admin.common.invoice-status-enum.${status}`)}</span>
		</div>
	);
};
