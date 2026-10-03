import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Mail, Phone } from "lucide-react";
import { IFinancier, IFinancierOffer, IFinancierSupplierContract } from "@/api/types";
import { AddNewContract } from "@/components/entities/admin/dashboard/suppliers/add-new-contract";
import { DetailCard } from "@/components/global/detail-card";
import { Icon } from "@/components/global/icon";
import { DetailRow } from "@/components/global/striped-card";
import { Button } from "@/components/ui/button";
import { useTranslationContext } from "@/contexts/translation";
import { formatCurrency } from "@/lib/format-currency";

dayjs.extend(relativeTime);

const DONUT_CX = 250;
const DONUT_CY = 190;
const DONUT_OUTER_RX = 185;
const DONUT_OUTER_RY = 99;
const DONUT_INNER_RX = 150;
const DONUT_INNER_RY = 75;

const toRad = (deg: number) => (deg * Math.PI) / 180;

const formatPercent = (value: number) => {
	const rounded = Math.round(value * 100) / 100;
	return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
};

const ellipsePoint = (angleDeg: number, rx: number, ry: number): [number, number] => [
	DONUT_CX + rx * Math.cos(toRad(angleDeg)),
	DONUT_CY + ry * Math.sin(toRad(angleDeg)),
];

const annulusSlicePath = (startDeg: number, endDeg: number, outerRx: number, outerRy: number, innerRx: number, innerRy: number) => {
	const largeArc = endDeg - startDeg > 180 ? 1 : 0;
	const [x1, y1] = ellipsePoint(startDeg, outerRx, outerRy);
	const [x2, y2] = ellipsePoint(endDeg, outerRx, outerRy);
	const [x3, y3] = ellipsePoint(endDeg, innerRx, innerRy);
	const [x4, y4] = ellipsePoint(startDeg, innerRx, innerRy);
	return `M ${x1} ${y1} A ${outerRx} ${outerRy} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRx} ${innerRy} 0 ${largeArc} 0 ${x4} ${y4} Z`;
};

const fullEllipsePath = (rx: number, ry: number, cy: number) =>
	`M ${DONUT_CX - rx} ${cy} A ${rx} ${ry} 0 1 1 ${DONUT_CX + rx} ${cy} A ${rx} ${ry} 0 1 1 ${DONUT_CX - rx} ${cy} Z`;

const calloutFor = (midDeg: number) => {
	const [ox, oy] = ellipsePoint(midDeg, DONUT_OUTER_RX, DONUT_OUTER_RY);
	const [lx, ly] = ellipsePoint(midDeg, DONUT_OUTER_RX + 20, DONUT_OUTER_RY + 38);
	const isRight = Math.cos(toRad(midDeg)) >= 0;
	return { ox, oy, lx, ly, isRight };
};

type FinancierWithContracts = IFinancier & {
	financierSupplierContracts: Array<
		IFinancierSupplierContract & {
			financierOffers: IFinancierOffer[];
		}
	>;
};

interface FinancierInformationProps {
	financier: FinancierWithContracts;
	activeTab: string;
	onTabChange: (tab: string) => void;
	latestSalesOrderDate?: string;
	latestInvoice?: {
		buyerName?: string;
		supplierName?: string;
		insurerName?: string;
		collectorName?: string;
		createdAt?: string;
		deliveryAmount?: number;
		deliveryDate?: string;
		financingAmount?: number;
		financingDate?: string;
		calcDiscount?: number;
		calcDifference?: number;
	};
}

export const FinancierInformation = ({
	financier,
	activeTab,
	onTabChange,
	latestSalesOrderDate,
	latestInvoice,
}: FinancierInformationProps) => {
	const { t } = useTranslationContext();

	const initials =
		financier.financierName
			?.split(" ")
			.map(w => w[0])
			.join("")
			.toUpperCase()
			.slice(0, 2) || "FN";

	const firstOffer = financier.financierSupplierContracts?.[0]?.financierOffers?.[0];
/* 	const financierEmail =
		financier.additionalInfo?.email ||
		financier.additionalInfo?.emailAddress ||
		financier.additionalInfo?.email_address ||
		(financier as any).emailAddress ||
		(financier as any).email ||
		"-"; */

	const tabs = [
		{ key: "details", label: t("admin.financiers.financier-details") },
		{ key: "contracts", label: t("admin.financiers.contract-offers") },
		// { key: "more", label: t("admin.common.more") },
	];

	const kpiCards = [
		{ label: t("admin.financiers.cr-number"), value: String(financier.crNumber) },
		{ label: t("admin.financiers.facility-name"), value: financier.facilityName },
		{ label: t("admin.financiers.financier-name"), value: financier.financierName },
		{ label: t("admin.financiers.limit"), value: formatCurrency(financier.limit, true) },
	];

	const consumedLimit = financier.limit - financier.calcAvailableLimit;
	const consumedPercent = financier.limit > 0 ? (consumedLimit / financier.limit) * 100 : 0;
	const availablePercent = 100 - consumedPercent;

	const consumedSweep = Math.min(
		Math.max((consumedPercent / 100) * 360, consumedLimit > 0 ? 10 : 0),
		financier.calcAvailableLimit > 0 ? 350 : 360,
	);
	const consumedStart = -90;
	const consumedEnd = consumedStart + consumedSweep;
	const availableStart = consumedEnd;
	const availableEnd = consumedStart + 360;

	const consumedCallout = calloutFor(consumedStart + consumedSweep / 2);
	const availableCallout = calloutFor(availableStart + (availableEnd - availableStart) / 2);

	return (
		<div className="flex flex-col gap-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-5">
					<div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-full bg-[#404040] text-[32px] font-bold text-white">
						{initials}
					</div>
					<div className="flex flex-col gap-3">
						<div className="flex flex-wrap items-center gap-3">
							<h2 className="text-[24px] font-bold leading-none text-[#404040]">{financier.facilityName}</h2>
							<div
								className={`h-[25px] inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-1 text-[16px] font-semibold ${financier.isCurrent ? "text-[#21A519]" : "text-[#C97A1F]"}`}
							>
								<span className={`h-2.5 w-2.5 rounded-full ${financier.isCurrent ? "bg-[#21A519]" : "bg-[#C97A1F]"}`} />
								{financier.isCurrent ? t("admin.buyers.active") : t("admin.buyers.inactive")}
							</div>

							<div className="ml-20 inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-2 text-[14px] text-[#5A5A5A]">
								<Phone className="h-4 w-4 text-[#404040]" />
								<span>{financier.additionalInfo?.phone || financier.additionalInfo?.contact || "-"}</span>
							</div>
							{/* <div className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-2 text-[14px] text-[#5A5A5A]">
								<Mail className="h-4 w-4 text-[#404040]" />
								<span>{financierEmail}</span>
							</div> */}
						</div>

						<div className="flex flex-wrap items-center gap-2 text-[16px] text-[#4A4A4A]">
							<span>
								Joined <span className="font-bold">{dayjs(financier.createdAt).format("MMM YYYY")}</span>
							</span>
							<span className="text-[#808080]">•</span>
							{/* <span>
								Last Sales Order{" "}
								<span className="font-bold">
									{latestSalesOrderDate ? dayjs(latestSalesOrderDate).format("DD MMM, YYYY") : "-"}
								</span>
							</span> */}
						</div>
					</div>
				</div>
				<AddNewContract
					financierId={financier.id}
					triggerButton={
						<Button>
							<Icon className="h-4 w-4 fill-white" name="PlusBox" />
							{t("admin.suppliers.add-new-contract")}
						</Button>
					}
				/>
			</div>

			{/* KPI Summary Bar */}
			<div className="flex justify-between gap-8">
				{kpiCards.map((card, i) => (
					<DetailCard key={i} label={card.label} value={card.value} />
				))}
			</div>

			{/* Tab Navigation */}
			<div className="flex gap-8 border-b border-gray-200">
				{tabs.map(tab => (
					<button
						key={tab.key}
						className={`pb-3 text-sm font-medium transition-colors ${
							activeTab === tab.key ? "border-b-2 border-[#2A82BE] text-gray-900" : "text-gray-400 hover:text-gray-600"
						}`}
						type="button"
						onClick={() => onTabChange(tab.key)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Financier Details Tab — Identity Panel + Limit Overview */}
			{activeTab === "details" && (
				<div className="flex gap-8">
					<div className="flex-1 rounded-xl border border-gray-100 bg-white shadow-sm">
						<div className="flex">
							<div className="w-2 shrink-0 rounded-l-xl bg-[#2A82BE]" />
							<div className="flex-1 p-6">
								<h3 className="mb-4 text-base font-bold text-gray-900">{t("admin.financiers.financier-details")}</h3>
								<DetailRow label={t("admin.financiers.cr-number")} value={financier.crNumber} />
								<DetailRow label={t("admin.financiers.facility-name")} value={financier.facilityName} />
								<DetailRow label={t("admin.financiers.financier-name")} value={financier.financierName} />
								<DetailRow label={t("admin.financiers.email")} value={financier.additionalInfo?.email} />
								<DetailRow label={t("admin.financiers.contact-number")} value={financier.additionalInfo?.phone} />
							</div>
						</div>
					</div>

					<div className="flex-1 rounded-xl border border-gray-100 bg-white shadow-sm">
						<div className="flex">
							<div className="w-2 shrink-0 rounded-l-xl bg-[#2A82BE]" />
							<div className="flex w-full flex-col items-center p-6">
								<h3 className="self-start text-base font-bold text-gray-900">{t("admin.financiers.limit")}</h3>

								<svg className="h-[340px] w-full max-w-[480px]" style={{ overflow: "visible" }} viewBox="0 0 460 340">
									{/* depth/extrusion base */}
									<path d={fullEllipsePath(DONUT_OUTER_RX, DONUT_OUTER_RY, DONUT_CY + 9)} fill="#0C2D48" />

									{/* slices */}
									<path
										d={annulusSlicePath(consumedStart, consumedEnd, DONUT_OUTER_RX, DONUT_OUTER_RY, DONUT_INNER_RX, DONUT_INNER_RY)}
										fill="#1E3A5F"
									/>
									<path
										d={annulusSlicePath(availableStart, availableEnd, DONUT_OUTER_RX, DONUT_OUTER_RY, DONUT_INNER_RX, DONUT_INNER_RY)}
										fill="#7DD3FC"
									/>

									{/* leader line — consumed */}
									<line stroke="#1E3A5F" strokeWidth={2} x1={consumedCallout.ox} x2={consumedCallout.lx} y1={consumedCallout.oy} y2={consumedCallout.ly} />
									<circle cx={consumedCallout.lx} cy={consumedCallout.ly} fill="#1E3A5F" r={3} />
									<text
										fill="#1E3A5F"
										fontSize={13}
										fontWeight={700}
										textAnchor={consumedCallout.isRight ? "start" : "end"}
										x={consumedCallout.lx + (consumedCallout.isRight ? 8 : -8)}
										y={consumedCallout.ly - 4}
									>
										{formatPercent(consumedPercent)}%
									</text>
									<text
										fill="#6B7280"
										fontSize={11}
										textAnchor={consumedCallout.isRight ? "start" : "end"}
										x={consumedCallout.lx + (consumedCallout.isRight ? 8 : -8)}
										y={consumedCallout.ly + 12}
									>
										{formatCurrency(consumedLimit, true)}
									</text>

									{/* leader line — available */}
									<line
										stroke="#0EA5E9"
										strokeWidth={2}
										x1={availableCallout.ox}
										x2={availableCallout.lx}
										y1={availableCallout.oy}
										y2={availableCallout.ly}
									/>
									<circle cx={availableCallout.lx} cy={availableCallout.ly} fill="#0EA5E9" r={3} />
									<text
										fill="#0EA5E9"
										fontSize={13}
										fontWeight={700}
										textAnchor={availableCallout.isRight ? "start" : "end"}
										x={availableCallout.lx + (availableCallout.isRight ? 8 : -8)}
										y={availableCallout.ly - 4}
									>
										{formatPercent(availablePercent)}%
									</text>
									<text
										fill="#6B7280"
										fontSize={11}
										textAnchor={availableCallout.isRight ? "start" : "end"}
										x={availableCallout.lx + (availableCallout.isRight ? 8 : -8)}
										y={availableCallout.ly + 12}
									>
										{formatCurrency(financier.calcAvailableLimit, true)}
									</text>

									{/* center label */}
									<text fill="#BAE6FD" fontSize={13} textAnchor="middle" x={DONUT_CX} y={DONUT_CY - 10}>
										{t("admin.financiers.limit")}
									</text>
									<text fill="#FFFFFF" fontSize={20} fontWeight={700} textAnchor="middle" x={DONUT_CX} y={DONUT_CY + 16}>
										{formatCurrency(financier.limit, true)}
									</text>
								</svg>

								<div className="mt-2 flex w-full justify-center gap-8">
									<div className="flex items-center gap-2">
										<span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1E3A5F]" />
										<span className="text-sm text-gray-500">{t("admin.financiers.consumed-limit")}</span>
									</div>

									<div className="flex items-center gap-2">
										<span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#7DD3FC]" />
										<span className="text-sm text-gray-500">{t("admin.financiers.calc-available-limit")}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
