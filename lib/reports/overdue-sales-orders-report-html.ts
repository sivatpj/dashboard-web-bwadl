import { IOverdueSalesOrderRow } from "@/api/endpoints/back-office/reports/fetch-overdue-sales-orders-report";
import { ReportThemeColors } from "@/lib/reports/report-entities";

export type ReportLanguage = "en" | "ar";

// Matches the "Supply Innovation" entity's colors — kept as the default so any
// caller that doesn't pass a theme renders exactly as before.
const DEFAULT_THEME: ReportThemeColors = {
	primary: "#0B4FD1",
	primaryDark: "#083A9E",
	tint: "#EAF6FD",
	tintBorder: "#CDEAFB",
	tintBorderStrong: "#E4F3FC",
};

export type OverdueReportColumnKey = keyof Pick<
	IOverdueSalesOrderRow,
	| "reference"
	| "orderDate"
	| "orderAmount"
	| "deliveryReference"
	| "deliveryDate"
	| "deliveryAmount"
	| "overdueAmount"
	| "delayedDays"
	| "buyerFacilityName"
>;

interface ColumnDef {
	key: OverdueReportColumnKey;
	label: string;
	labelAr: string;
	align: "left" | "right";
	width: string;
}

// Column definitions: label, data key, align, width — same set the backend used to
// hardcode. The user can uncheck any of these in the preview dialog; unchecked
// columns are filtered out below before either the preview or the sent PDF is built.
export const OVERDUE_REPORT_COLUMNS: ColumnDef[] = [
	{ key: "reference", label: "Order Reference", labelAr: "مرجع الطلب", align: "left", width: "13%" },
	{ key: "orderDate", label: "Order Date", labelAr: "تاريخ الطلب", align: "left", width: "9%" },
	{ key: "orderAmount", label: "Order Amount", labelAr: "مبلغ الطلب", align: "right", width: "10%" },
	{ key: "deliveryReference", label: "Delivery Reference", labelAr: "مرجع التسليم", align: "left", width: "13%" },
	{ key: "deliveryDate", label: "Delivery Date", labelAr: "تاريخ التسليم", align: "left", width: "9%" },
	{ key: "deliveryAmount", label: "Delivery Amount", labelAr: "مبلغ التسليم", align: "right", width: "10%" },
	{ key: "overdueAmount", label: "Overdue Amount", labelAr: "المبلغ المتأخر", align: "right", width: "11%" },
	{ key: "delayedDays", label: "Delayed Days", labelAr: "أيام التأخير", align: "right", width: "9%" },
	{ key: "buyerFacilityName", label: "Buyer Facility", labelAr: "منشأة المشتري", align: "left", width: "16%" },
];

const COLUMNS_BY_KEY_FOR_LABEL = new Map(OVERDUE_REPORT_COLUMNS.map(col => [col.key, col]));

export const getColumnLabel = (key: OverdueReportColumnKey, language: ReportLanguage) => {
	const col = COLUMNS_BY_KEY_FOR_LABEL.get(key);
	if (!col) return "";
	return language === "ar" ? col.labelAr : col.label;
};

const REPORT_STRINGS: Record<ReportLanguage, {
	reportKicker: string;
	generated: string;
	title: string;
	supplier: string;
	collector: string;
	overdueAsOf: string;
	totalOverdue: string;
	footerNote: (overdueAsOfDate: string) => string;
}> = {
	en: {
		reportKicker: "Overdue Sales Orders Report",
		generated: "Generated",
		title: "Overdue Sales Orders",
		supplier: "Supplier",
		collector: "Collector",
		overdueAsOf: "Overdue As Of",
		totalOverdue: "TOTAL OVERDUE",
		footerNote: overdueAsOfDate =>
			`Amounts are stated in SAR. Overdue is calculated as remaining collection amounts with eligible date before ${overdueAsOfDate}.`,
	},
	ar: {
		reportKicker: "تقرير أوامر البيع المتأخرة",
		generated: "تاريخ الإنشاء",
		title: "أوامر البيع المتأخرة",
		supplier: "المورد",
		collector: "المحصّل",
		overdueAsOf: "المتأخر كما في",
		totalOverdue: "إجمالي المبلغ المتأخر",
		footerNote: overdueAsOfDate =>
			`المبالغ مذكورة بالريال السعودي. يُحتسب التأخر بناءً على مبالغ التحصيل المتبقية التي يكون تاريخ استحقاقها قبل ${overdueAsOfDate}.`,
	},
};

const AMOUNT_KEYS = new Set<OverdueReportColumnKey>(["orderAmount", "deliveryAmount", "overdueAmount"]);

const escapeHtml = (value: unknown) =>
	String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

const formatAmount = (value: unknown) => {
	const num = Number(value);
	if (isNaN(num)) return escapeHtml(value);
	return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface BuildParams {
	overdueAsOfDate: string;
	rows: IOverdueSalesOrderRow[];
	supplierFacilityName: string | null;
	collectorFacilityName: string | null;
	selectedColumns: OverdueReportColumnKey[];
	language?: ReportLanguage;
	theme?: ReportThemeColors;
}

export const buildOverdueSalesOrdersReportHtml = ({
	overdueAsOfDate,
	rows,
	supplierFacilityName,
	collectorFacilityName,
	selectedColumns,
	language = "en",
	theme = DEFAULT_THEME,
}: BuildParams) => {
	const isRtl = language === "ar";
	const strings = REPORT_STRINGS[language];

	// The live dashboard table gets its mirrored RTL layout for free from the
	// browser (dir="rtl" on <html> flips physical column/flex order natively; see
	// app/layout.tsx + components/ui/data-table.tsx, where each column's own
	// text-align is set once and never swapped per language). Our hand-rolled PDF
	// renderer has no such CSS direction support, so we reproduce the same visual
	// result manually: reverse the physical column order for Arabic, but leave each
	// column's own alignment untouched — exactly what the browser does.
	const columnsByKey = new Map(OVERDUE_REPORT_COLUMNS.map(col => [col.key, col]));
	const orderedColumns = selectedColumns.map(key => columnsByKey.get(key)).filter((col): col is ColumnDef => !!col);
	const columns = isRtl ? [...orderedColumns].reverse() : orderedColumns;
	const totalOverdue = rows.reduce((sum, r) => sum + Number(r.overdueAmount || 0), 0);
	const showTotal = columns.some(col => col.key === "overdueAmount");

	const headerCells = columns
		.map(
			col =>
				`<th style="width:${col.width};padding:6px 6px;text-align:left;font-size:7px;font-weight:600;letter-spacing:0.02em;border-bottom:2px solid ${theme.tintBorder};white-space:nowrap;">${escapeHtml(getColumnLabel(col.key, language))}</th>`,
		)
		.join("");

	const tableRows = rows
		.map((row, i) => {
			const bg = i % 2 === 1 ? theme.tint : "#ffffff";
			const tds = columns
				.map(col => {
					const raw = row[col.key];
					const display = AMOUNT_KEYS.has(col.key) ? formatAmount(raw) : escapeHtml(raw);
					return `<td style="padding:4px 6px;text-align:${col.align};border-bottom:1px solid ${theme.tintBorderStrong};">${display}</td>`;
				})
				.join("");
			return `<tr style="background-color:${bg};">${tds}</tr>`;
		})
		.join("");

	// Same mirroring rule applied to this two-item meta row (Supplier | Collector):
	// reverse the physical order for Arabic instead of flipping any alignment.
	const metaParts = [
		supplierFacilityName
			? `<span><span style="color:#8a9ab0;font-size:8.5px;text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(strings.supplier)}:</span>&nbsp;&nbsp;<strong style="font-size:10px;color:#1a2a3a;">${escapeHtml(supplierFacilityName)}</strong></span>`
			: null,
		collectorFacilityName
			? `<span><span style="color:#8a9ab0;font-size:8.5px;text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(strings.collector)}:</span>&nbsp;&nbsp;<strong style="font-size:10px;color:#1a2a3a;">${escapeHtml(collectorFacilityName)}</strong></span>`
			: null,
	];
	const metaItems = (isRtl ? [...metaParts].reverse() : metaParts)
		.filter(Boolean)
		.join(`<strong style="color:#9fb4c9;margin:0 28px;">|</strong>`);

	const dateItems = `<span style="white-space:nowrap;"><span style="color:#8a9ab0;font-size:8.5px;text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(strings.overdueAsOf)}:</span>&nbsp;&nbsp;<strong style="font-size:10px;color:#1a2a3a;">${escapeHtml(overdueAsOfDate)}</strong></span>`;

	const dirAttr = isRtl ? ` dir="rtl" style="direction:rtl;"` : "";
	const titleAlign = isRtl ? "right" : "left";
	const borderSide = isRtl ? "border-right" : "border-left";

	return `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a2a3a;"${dirAttr}>

      <!-- Title + Meta block -->
      <div style="${borderSide}:4px solid ${theme.primary};padding:8px 10px 6px 10px;margin-bottom:4px;background:${theme.tint};text-align:${titleAlign};">
        <div style="font-size:13px;font-weight:700;color:${theme.primaryDark};letter-spacing:-0.01em;margin-bottom:5px;">${escapeHtml(strings.title)}</div>
        ${metaItems ? `<div style="font-size:10px;margin-bottom:3px;">${metaItems}</div>` : ""}
        <div style="font-size:10px;">${dateItems}</div>
      </div>

      <!-- Divider -->
      <div style="height:0.5px;background-color:#000000;margin-bottom:10px;"></div>

      <!-- Table -->
      <table style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:7px;">
        <thead>
          <tr style="background-color:${theme.primaryDark};color:#ffffff;">
            ${headerCells}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        ${
					showTotal
						? (() => {
								const overdueIndex = columns.findIndex(col => col.key === "overdueAmount");
								const labelCell =
									overdueIndex > 0
										? `<td colspan="${overdueIndex}" style="padding:6px 6px;text-align:right;font-size:7px;letter-spacing:0.02em;">${escapeHtml(strings.totalOverdue)}</td>`
										: "";
								const totalCell = `<td style="padding:6px 6px;text-align:right;font-size:7px;">${formatAmount(totalOverdue)}</td>`;
								const trailingCells =
									overdueIndex < columns.length - 1
										? `<td colspan="${columns.length - overdueIndex - 1}"></td>`
										: "";
								return `<tfoot>
          <tr style="background-color:${theme.primaryDark};color:#ffffff;font-weight:700;">
            ${labelCell}${totalCell}${trailingCells}
          </tr>
        </tfoot>`;
							})()
						: ""
				}
      </table>

      <!-- Footer note -->
      <div style="margin-top:10px;font-size:7.5px;color:#b0bec5;border-top:1px solid ${theme.tintBorderStrong};padding-top:6px;text-align:${titleAlign};">
        ${escapeHtml(strings.footerNote(overdueAsOfDate))}
      </div>
    </div>`;
};