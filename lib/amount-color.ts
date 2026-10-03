/**
 * Shared color coding for financial amount columns (Paid, Outstanding/Remaining, Overdue).
 * "positive" = good when > 0 (e.g. Paid Amount) -> green.
 * "negative" = bad when > 0 (e.g. Outstanding/Remaining) -> amber.
 * "overdue" = worse when > 0 (e.g. Overdue Amount) -> red, so it stands out from outstanding.
 */
export function amountColorClass(value: number | null | undefined, variant: "positive" | "negative" | "overdue"): string {
	if (value == null || value <= 0) return "";

	switch (variant) {
		case "positive":
			return "text-[#1E8E3E] font-medium";
		case "negative":
			return "text-[#B7791F] font-medium";
		case "overdue":
			return "text-[#D93025] font-medium";
	}
}
