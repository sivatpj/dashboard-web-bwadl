export interface ParsedSvgPath {
	d: string;
	fill?: string;
}

export interface ParsedSvg {
	viewBox: string;
	paths: ParsedSvgPath[];
}

// Minimal, dependency-free SVG reader: pulls the viewBox and every <path>'s `d`/`fill`
// out of raw SVG markup. Only handles the flat, path-only logos this app uses for report
// letterheads (no groups/transforms/gradients) — good enough to keep the PDF engine from
// needing a full SVG renderer or a build-time raster conversion step.
export function parseSvgPaths(svgText: string): ParsedSvg {
	const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/i);
	const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 100 100";

	const paths: ParsedSvgPath[] = [];
	const pathTagRegex = /<path\b[^>]*>/gi;
	let match: RegExpExecArray | null;
	while ((match = pathTagRegex.exec(svgText))) {
		const tag = match[0];
		const dMatch = tag.match(/\bd="([^"]*)"/i);
		if (!dMatch) continue;
		const fillMatch = tag.match(/\bfill="([^"]*)"/i);
		paths.push({ d: dMatch[1], fill: fillMatch ? fillMatch[1] : undefined });
	}

	return { viewBox, paths };
}