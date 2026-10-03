import type { ParsedSvg } from "./svg-utils";

const blobStream = require("blob-stream");
const { htmlToPdf } = require("./engine");

interface RenderTheme {
	primary: string;
	primaryDark: string;
	tint: string;
	tintBorder: string;
	tintBorderStrong: string;
}

interface RenderOptions {
	logo?: ArrayBuffer;
	logoSvg?: ParsedSvg;
	logoLabelLines?: string[];
	addressLines?: string[];
	tagline?: string;
	footerContact?: string;
	pageNumbers?: boolean;
	margin?: number;
	margins?: { top: number; bottom: number; left: number; right: number };
	size?: string;
	layout?: string;
	theme?: RenderTheme;
}

// Browser counterpart of the backend's renderHtmlToPdfBuffer: uses blob-stream
// instead of a Node PassThrough, resolving a Blob instead of a Buffer.
export const renderHtmlToPdfBlob = (
	html: string,
	{
		logo,
		logoSvg,
		logoLabelLines,
		addressLines,
		tagline,
		footerContact,
		pageNumbers = true,
		margin = 50,
		margins,
		size = "A4",
		layout = "portrait",
		theme,
	}: RenderOptions = {},
): Promise<Blob> => {
	return new Promise((resolve, reject) => {
		const stream = blobStream();
		stream.on("finish", () => resolve(stream.toBlob("application/pdf")));
		stream.on("error", reject);

		htmlToPdf(html, {
			stream,
			margin,
			margins,
			size,
			layout,
			logo,
			logoSvg,
			logoLabelLines,
			addressLines,
			tagline,
			footerContact,
			pageNumbers,
			theme,
		})
			.then((doc: any) => doc.on("error", reject))
			.catch(reject);
	});
};