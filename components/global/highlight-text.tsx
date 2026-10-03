// ─── Centralised highlight style ────────────────────────────────────────────
// Change HIGHLIGHT_CLASS here to restyle every search highlight in the app.
const HIGHLIGHT_CLASS = "text-amber-500";
// ────────────────────────────────────────────────────────────────────────────

interface HighlightTextProps {
	text: string | null | undefined;
	query: string | null | undefined;
}

export const HighlightText = ({ text, query }: HighlightTextProps) => {
	const str = text ?? "";

	if (!query || query.trim() === "") return <span>{str}</span>;

	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const parts = str.split(new RegExp(`(${escaped})`, "gi"));

	return (
		<span>
			{parts.map((part, i) =>
				i % 2 === 1 ? (
					<span key={i} className={HIGHLIGHT_CLASS}>{part}</span>
				) : (
					part
				),
			)}
		</span>
	);
};
