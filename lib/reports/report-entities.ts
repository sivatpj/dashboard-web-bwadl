export type ReportEntityId = "supply-innovation" | "bwadl";

export interface ReportThemeColors {
	// Solid accent used for table header/footer bands and bold headings.
	primary: string;
	// Darker variant used where the table header itself needs more contrast.
	primaryDark: string;
	// Very light tint used for the title block background and letterhead panel.
	tint: string;
	// Light border/rule colors that sit on top of `tint`.
	tintBorder: string;
	tintBorderStrong: string;
}

export interface ReportEntityConfig {
	id: ReportEntityId;
	label: string;
	// ".png"/".jpg" are fetched as a raster image; ".svg" is fetched as text and
	// vector-drawn directly by the PDF engine (see lib/pdf-engine/svg-utils.ts) —
	// no raster asset needs to be generated for SVG-only logos.
	logoSrc: string;
	logoLabelLines?: string[];
	addressLines: string[];
	tagline?: string;
	footerContact?: string;
	theme: ReportThemeColors;
	// Space to reserve above the report content for this entity's letterhead band
	// (logo card + address + tagline) — shorter for entities with a smaller card
	// and/or no tagline, so the gap before the content doesn't grow unnecessarily.
	headerMarginTop: number;
}

// Single source of truth for report branding: everything the "Choose Entity" step
// and the PDF letterhead need to render either entity's identity. Add a new entity
// here (and its logo asset) to make it available everywhere reports are generated.
export const REPORT_ENTITIES: Record<ReportEntityId, ReportEntityConfig> = {
	"supply-innovation": {
		id: "supply-innovation",
		label: "Supply Innovation",
		logoSrc: "/static/assets/reports/supply-innovation-logo.svg",
		logoLabelLines: ["Supply", "Innovation"],
		addressLines: [
			"Ash Shati Business Center, Prince Mohammad Ibn Fahad Rd",
			"Ash Shati Asharqi District",
			"Dammam DMM 34211",
			"Saudi Arabia",
			"VAT : 314156075400003",
		],
		tagline: "Digital ordering infrastructure",
		footerContact: "contactus@supplyinnovation.sa | https://supplyinnovation.sa | +966538458663",
		theme: {
			primary: "#0B4FD1",
			primaryDark: "#083A9E",
			tint: "#EAF6FD",
			tintBorder: "#CDEAFB",
			tintBorderStrong: "#E4F3FC",
		},
		headerMarginTop: 145,
	},
	bwadl: {
		id: "bwadl",
		label: "bwadl",
		// This SVG already bakes in the "bwadl" wordmark beneath the icon, so no
		// separate logoLabelLines/tagline is needed to spell out the name again.
		logoSrc: "/static/assets/reports/bwadl-logo.svg",
		addressLines: [],
		theme: {
			primary: "#2A82BE",
			primaryDark: "#1A1347",
			tint: "#EAF1FB",
			tintBorder: "#D6E4F5",
			tintBorderStrong: "#E6EEFB",
		},
		headerMarginTop: 100,
	},
};

export const REPORT_ENTITY_LIST = Object.values(REPORT_ENTITIES);