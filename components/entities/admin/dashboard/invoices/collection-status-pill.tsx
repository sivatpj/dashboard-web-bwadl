import { ICollection } from "@/api/types";
import { useTranslationContext } from "@/contexts/translation";
import { getCollectionStatus } from "@/lib/get-collection-status";

interface CollectionStatusPillProps {
	collection: ICollection;
}

export const CollectionStatusPill = (props: CollectionStatusPillProps) => {
	const { collection } = props;

	const { t } = useTranslationContext();

	const status = getCollectionStatus(collection);

	const stylesMap = new Map<typeof status, { bg: string; text: string }>([
		["Paid", { bg: "#E1FCEF", text: "#38A06C" }],
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
