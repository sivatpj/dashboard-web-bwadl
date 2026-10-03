"use client";

import { useEffect, useRef, useState } from "react";
import { Check, GripVertical, Plus, X } from "lucide-react";
import { IOverdueSalesOrderRow } from "@/api/endpoints/back-office/reports/fetch-overdue-sales-orders-report";
import { useFetchParticipants } from "@/api/endpoints/report-notification/fetch-participants";
import { useSendReportEmail } from "@/api/endpoints/report-notification/send-report-email";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";
import {
	OVERDUE_REPORT_COLUMNS,
	OverdueReportColumnKey,
	ReportLanguage,
	buildOverdueSalesOrdersReportHtml,
	getColumnLabel,
} from "@/lib/reports/overdue-sales-orders-report-html";
import { REPORT_ENTITIES, REPORT_ENTITY_LIST, ReportEntityId } from "@/lib/reports/report-entities";
import { parseSvgPaths } from "@/lib/pdf-engine/svg-utils";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	rows: IOverdueSalesOrderRow[];
	overdueAsOfDate: string;
	collectorId?: number;
	collectorFacilityName?: string;
	supplierId?: number;
	supplierFacilityName?: string;
	buyerId?: number;
	buyerFacilityName?: string;
}

const LANGUAGE_NOTIFICATION_MAP: Record<string, string> = {
	en: "NTF001",
	ar: "NTF002",
};

interface RecipientState {
	checked: boolean;
	email: string;
	hasSystemEmail: boolean;
}

type Step = "entity" | "language" | "columns" | "preview" | "send";

const STEPS: { key: Step; labelKey: string }[] = [
	{ key: "entity", labelKey: "admin.reports.step-entity" },
	{ key: "language", labelKey: "admin.reports.step-language" },
	{ key: "columns", labelKey: "admin.reports.step-columns" },
	{ key: "preview", labelKey: "admin.reports.step-preview" },
	{ key: "send", labelKey: "admin.reports.step-send" },
];

const DEFAULT_RECIPIENT: RecipientState = { checked: true, email: "", hasSystemEmail: false };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_COLUMN_ORDER = OVERDUE_REPORT_COLUMNS.map(c => c.key);
const COLUMNS_BY_KEY = new Map(OVERDUE_REPORT_COLUMNS.map(c => [c.key, c]));

export const ReportPreviewDialog = ({
	open,
	onOpenChange,
	rows,
	overdueAsOfDate,
	collectorId,
	collectorFacilityName,
	supplierId,
	supplierFacilityName,
	buyerId,
	buyerFacilityName,
}: Props) => {
	const { t } = useTranslationContext();
	const { toast } = useToast();

	const isDirectCollector = collectorFacilityName === "Direct";
	const showCollector = !!collectorId && !isDirectCollector;
	const showSupplier = !!supplierId;
	const showBuyer = !!buyerId;

	const [step, setStep] = useState<Step>("entity");
	const [entityId, setEntityId] = useState<ReportEntityId>("supply-innovation");
	const [columnOrder, setColumnOrder] = useState<OverdueReportColumnKey[]>(DEFAULT_COLUMN_ORDER);
	const [checkedColumns, setCheckedColumns] = useState<Set<OverdueReportColumnKey>>(new Set(DEFAULT_COLUMN_ORDER));
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	const dragIndexRef = useRef<number | null>(null);
	const selectedColumns = columnOrder.filter(key => checkedColumns.has(key));
	const isDefaultColumnOrder = columnOrder.every((key, index) => key === DEFAULT_COLUMN_ORDER[index]);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
	const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

	const [language, setLanguage] = useState<ReportLanguage>("en");
	const [isSending, setIsSending] = useState(false);
	const [collector, setCollector] = useState<RecipientState>(DEFAULT_RECIPIENT);
	const [supplier, setSupplier] = useState<RecipientState>(DEFAULT_RECIPIENT);
	const [buyer, setBuyer] = useState<RecipientState>(DEFAULT_RECIPIENT);
	const [customEmails, setCustomEmails] = useState<string[]>([""]);

	const { data: collectorParticipants } = useFetchParticipants(
		{ participantType: "collector" },
		{ enabled: open && !!collectorId && !isDirectCollector },
	);
	const { data: supplierParticipants } = useFetchParticipants(
		{ participantType: "supplier" },
		{ enabled: open && !!supplierId },
	);
	const { data: buyerParticipants } = useFetchParticipants(
		{ participantType: "buyer" },
		{ enabled: open && !!buyerId },
	);

	useEffect(() => {
		if (!open) return;
		const found = collectorParticipants?.participants.find(p => p.id === collectorId);
		const email = found?.email ?? "";
		setCollector(prev => ({ ...prev, email, hasSystemEmail: !!email }));
	}, [collectorParticipants, collectorId, open]);

	useEffect(() => {
		if (!open) return;
		const found = supplierParticipants?.participants.find(p => p.id === supplierId);
		const email = found?.email ?? "";
		setSupplier(prev => ({ ...prev, email, hasSystemEmail: !!email }));
	}, [supplierParticipants, supplierId, open]);

	useEffect(() => {
		if (!open) return;
		const found = buyerParticipants?.participants.find(p => p.id === buyerId);
		const email = found?.email ?? "";
		setBuyer(prev => ({ ...prev, email, hasSystemEmail: !!email }));
	}, [buyerParticipants, buyerId, open]);

	useEffect(() => {
		if (!open) {
			setStep("entity");
			setEntityId("supply-innovation");
			setColumnOrder(DEFAULT_COLUMN_ORDER);
			setCheckedColumns(new Set(DEFAULT_COLUMN_ORDER));
			setPreviewUrl(prevUrl => {
				if (prevUrl) URL.revokeObjectURL(prevUrl);
				return null;
			});
			setPreviewBlob(null);
			setCollector(DEFAULT_RECIPIENT);
			setSupplier(DEFAULT_RECIPIENT);
			setBuyer(DEFAULT_RECIPIENT);
			setCustomEmails([""]);
			setLanguage("en");
			setIsSending(false);
		}
	}, [open]);

	const updateCustomEmail = (index: number, value: string) => {
		setCustomEmails(prev => prev.map((email, i) => (i === index ? value : email)));
	};

	const addCustomEmail = () => {
		setCustomEmails(prev => [...prev, ""]);
	};

	const removeCustomEmail = (index: number) => {
		setCustomEmails(prev => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== index)));
	};

	const toggleColumn = (key: OverdueReportColumnKey, checked: boolean) => {
		setCheckedColumns(prev => {
			const next = new Set(prev);
			if (checked) next.add(key);
			else next.delete(key);
			return next;
		});
	};

	const allColumnsSelected = checkedColumns.size === OVERDUE_REPORT_COLUMNS.length;
	const toggleAllColumns = () => {
		setCheckedColumns(allColumnsSelected ? new Set() : new Set(DEFAULT_COLUMN_ORDER));
	};

	const moveColumn = (index: number, direction: -1 | 1) => {
		const target = index + direction;
		if (target < 0 || target >= columnOrder.length) return;
		setColumnOrder(prev => {
			const next = [...prev];
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});
	};

	const handleColumnDragStart = (index: number) => (e: React.DragEvent) => {
		dragIndexRef.current = index;
		e.dataTransfer.effectAllowed = "move";
	};

	const handleColumnDragOver = (index: number) => (e: React.DragEvent) => {
		e.preventDefault();
		if (dragIndexRef.current === null) return;
		if (dragOverIndex !== index) setDragOverIndex(index);
	};

	const handleColumnDrop = (index: number) => (e: React.DragEvent) => {
		e.preventDefault();
		const from = dragIndexRef.current;
		dragIndexRef.current = null;
		setDragOverIndex(null);
		if (from === null || from === index) return;
		setColumnOrder(prev => {
			const next = [...prev];
			const [moved] = next.splice(from, 1);
			next.splice(index, 0, moved);
			return next;
		});
	};

	const handleColumnDragEnd = () => {
		dragIndexRef.current = null;
		setDragOverIndex(null);
	};

	const generatePreview = async () => {
		setIsGeneratingPreview(true);
		try {
			const { renderHtmlToPdfBlob } = await import("@/lib/pdf-engine");
			const entity = REPORT_ENTITIES[entityId];
			const isSvgLogo = entity.logoSrc.endsWith(".svg");
			const logo = isSvgLogo ? undefined : await fetch(entity.logoSrc).then(res => res.arrayBuffer());
			const logoSvg = isSvgLogo
				? await fetch(entity.logoSrc)
						.then(res => res.text())
						.then(parseSvgPaths)
				: undefined;
			const html = buildOverdueSalesOrdersReportHtml({
				overdueAsOfDate,
				rows,
				supplierFacilityName: supplierFacilityName ?? null,
				collectorFacilityName: collectorFacilityName ?? null,
				selectedColumns,
				language,
				theme: entity.theme,
			});
			const blob: Blob = await renderHtmlToPdfBlob(html, {
				logo,
				logoSvg,
				logoLabelLines: entity.logoLabelLines,
				addressLines: entity.addressLines,
				tagline: entity.tagline,
				footerContact: entity.footerContact,
				pageNumbers: true,
				layout: "portrait",
				margins: { top: entity.headerMarginTop, bottom: 60, left: 24, right: 24 },
				theme: entity.theme,
			});
			setPreviewUrl(prevUrl => {
				if (prevUrl) URL.revokeObjectURL(prevUrl);
				return URL.createObjectURL(blob);
			});
			setPreviewBlob(blob);
			setStep("preview");
		} catch (err) {
			toast({
				description: t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		} finally {
			setIsGeneratingPreview(false);
		}
	};

	const { mutateAsync } = useSendReportEmail();

	const notificationInput = { overdueAsOfDate };

	const handleSend = async () => {
		if (!previewBlob) return;
		setIsSending(true);
		try {
			if (showCollector && collector.checked && collectorId) {
				await mutateAsync({
					file: previewBlob,
					participantType: "collector",
					participantId: collectorId,
					notificationCode: LANGUAGE_NOTIFICATION_MAP[language],
					language,
					email: collector.email || undefined,
					notificationInput,
				});
			}
			if (showSupplier && supplier.checked && supplierId) {
				await mutateAsync({
					file: previewBlob,
					participantType: "supplier",
					participantId: supplierId,
					notificationCode: LANGUAGE_NOTIFICATION_MAP[language],
					language,
					email: supplier.email || undefined,
					notificationInput,
				});
			}
			if (showBuyer && buyer.checked && buyerId) {
				await mutateAsync({
					file: previewBlob,
					participantType: "buyer",
					participantId: buyerId,
					notificationCode: LANGUAGE_NOTIFICATION_MAP[language],
					language,
					email: buyer.email || undefined,
					notificationInput,
				});
			}
			for (const rawEmail of customEmails) {
				const email = rawEmail.trim();
				if (!email) continue;
				await mutateAsync({
					file: previewBlob,
					participantType: "custom",
					participantId: 0,
					notificationCode: LANGUAGE_NOTIFICATION_MAP[language],
					language,
					email,
					notificationInput,
				});
			}
			toast({ description: t("admin.reports.send-success"), variant: "success" });
			onOpenChange(false);
		} catch (err) {
			toast({
				description: (err as any)?.response?.data?.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		} finally {
			setIsSending(false);
		}
	};

	const collectorReady = !showCollector || !collector.checked || !!collector.email.trim();
	const supplierReady = !showSupplier || !supplier.checked || !!supplier.email.trim();
	const buyerReady = !showBuyer || !buyer.checked || !!buyer.email.trim();
	const filledCustomEmails = customEmails.map(e => e.trim()).filter(Boolean);
	const customEmailsValid = filledCustomEmails.every(e => EMAIL_REGEX.test(e));
	const atLeastOneChecked =
		(showCollector && collector.checked) ||
		(showSupplier && supplier.checked) ||
		(showBuyer && buyer.checked) ||
		filledCustomEmails.length > 0;

	const emailCounts = new Map<string, number>();
	const countEmail = (email: string) => {
		const normalized = email.trim().toLowerCase();
		if (!normalized) return;
		emailCounts.set(normalized, (emailCounts.get(normalized) ?? 0) + 1);
	};
	if (showCollector && collector.checked) countEmail(collector.email);
	if (showSupplier && supplier.checked) countEmail(supplier.email);
	if (showBuyer && buyer.checked) countEmail(buyer.email);
	customEmails.forEach(countEmail);
	const isDuplicateEmail = (email: string) => {
		const normalized = email.trim().toLowerCase();
		return !!normalized && (emailCounts.get(normalized) ?? 0) > 1;
	};
	const hasDuplicateEmails = [...emailCounts.values()].some(count => count > 1);

	const canSend =
		atLeastOneChecked && collectorReady && supplierReady && buyerReady && customEmailsValid && !hasDuplicateEmails;

	const currentStepIndex = STEPS.findIndex(s => s.key === step);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex h-[92vh] w-[1400px] max-w-[97vw] flex-col overflow-hidden p-8">
				<DialogHeader className="mb-2 shrink-0">
					<DialogTitle className="text-xl">{t("admin.reports.send-report")}</DialogTitle>
					<DialogDescription className="sr-only">{t("admin.reports.send-report")}</DialogDescription>
				</DialogHeader>

				<div className="shrink-0">
					<Stepper currentIndex={currentStepIndex} />
				</div>

				{step === "entity" && (
					<div className="flex min-h-0 flex-1 flex-col gap-6">
						<div className="flex flex-1 flex-col items-center overflow-y-auto pr-1 text-center">
							<div className="mb-6">
								<h3 className="text-lg font-semibold text-foreground">{t("admin.reports.choose-entity-title")}</h3>
								<p className="text-sm text-muted-foreground">{t("admin.reports.choose-entity-subtitle")}</p>
							</div>

							<div className="flex flex-wrap justify-center gap-5">
								{REPORT_ENTITY_LIST.map(entity => {
									const selected = entityId === entity.id;
									return (
										<button
											key={entity.id}
											type="button"
											onClick={() => setEntityId(entity.id)}
											className={`group relative flex w-[220px] flex-col items-center gap-4 rounded-[10px] border-2 bg-white px-6 py-7 shadow-sm transition-all ${
												selected
													? "border-primary shadow-md ring-4 ring-primary/10"
													: "border-input hover:border-primary/40 hover:shadow-md"
											}`}
										>
											{selected && (
												<span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
													<Check className="h-3.5 w-3.5" />
												</span>
											)}
											<div className="flex h-24 w-24 items-center justify-center rounded-[8px] border border-input bg-muted/20 p-3">
												<img
													src={entity.logoSrc}
													alt={entity.label}
													className="max-h-full max-w-full object-contain"
												/>
											</div>
											<span
												className={`text-sm font-semibold transition-colors ${
													selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
												}`}
											>
												{entity.label}
											</span>
										</button>
									);
								})}
							</div>
						</div>

						<div className="flex shrink-0 gap-4 border-t border-border pt-6">
							<Button className="flex-1" variant="outline" onClick={() => onOpenChange(false)}>
								{t("admin.common.cancel")}
							</Button>
							<Button className="flex-1" onClick={() => setStep("language")}>
								{t("admin.reports.next-language")}
							</Button>
						</div>
					</div>
				)}

				{step === "language" && (
					<div className="flex min-h-0 flex-1 flex-col gap-6">
						<div className="flex flex-1 flex-col items-center overflow-y-auto pr-1 text-center">
							<div className="mb-6">
								<h3 className="text-lg font-semibold text-foreground">{t("admin.reports.choose-language-title")}</h3>
								<p className="text-sm text-muted-foreground">{t("admin.reports.choose-language-subtitle")}</p>
							</div>

							<div className="flex w-fit overflow-hidden rounded-[5px] border border-[#D9D9D9]">
								{(["en", "ar"] as const).map(lang => (
									<button
										key={lang}
										type="button"
										onClick={() => setLanguage(lang)}
										className={`px-8 py-2 text-sm font-medium transition-colors ${
											language === lang ? "bg-[#404040] text-white" : "bg-white text-[#404040] hover:bg-gray-50"
										}`}
									>
										{lang === "en" ? t("admin.reports.language-english") : t("admin.reports.language-arabic")}
									</button>
								))}
							</div>
						</div>

						<div className="flex shrink-0 gap-4 border-t border-border pt-6">
							<Button className="flex-1" variant="outline" onClick={() => setStep("entity")}>
								{t("admin.common.back")}
							</Button>
							<Button className="flex-1" onClick={() => setStep("columns")}>
								{t("admin.reports.next-columns")}
							</Button>
						</div>
					</div>
				)}

				{step === "columns" && (
					<div className="flex min-h-0 flex-1 flex-col gap-6">
						<div className="flex-1 overflow-y-auto pr-1">
							<div className="mb-6">
								<h3 className="text-lg font-semibold text-foreground">{t("admin.reports.select-columns-title")}</h3>
								<p className="text-sm text-muted-foreground">{t("admin.reports.select-columns-subtitle")}</p>
							</div>

							<div className="mb-4 flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									{t("admin.reports.columns-selected-count", {
										count: selectedColumns.length,
										total: OVERDUE_REPORT_COLUMNS.length,
									})}
								</span>
								<div className="flex items-center gap-4">
									<button
										type="button"
										onClick={() => setColumnOrder(DEFAULT_COLUMN_ORDER)}
										disabled={isDefaultColumnOrder}
										className="text-sm font-medium text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
									>
										{t("admin.reports.reset-order")}
									</button>
									<button type="button" onClick={toggleAllColumns} className="text-sm font-medium text-primary underline-offset-2 hover:underline">
										{allColumnsSelected ? t("admin.reports.deselect-all") : t("admin.reports.select-all")}
									</button>
								</div>
							</div>

							<p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
								<GripVertical className="h-3.5 w-3.5" />
								{t("admin.reports.select-columns-drag-hint")}
							</p>

							<div className="mx-auto flex max-w-2xl flex-col gap-2">
								{columnOrder.map((key, index) => {
									const col = COLUMNS_BY_KEY.get(key)!;
									const checked = checkedColumns.has(key);
									const isDragOver = dragOverIndex === index;
									return (
										<div
											key={key}
											draggable
											onDragStart={handleColumnDragStart(index)}
											onDragOver={handleColumnDragOver(index)}
											onDrop={handleColumnDrop(index)}
											onDragEnd={handleColumnDragEnd}
											className={`flex items-center gap-3 rounded-[5px] border px-3 py-2.5 transition-colors ${
												checked ? "border-primary bg-primary/5" : "border-input bg-muted/30"
											} ${isDragOver ? "border-primary border-dashed" : ""}`}
										>
											<span
												className="cursor-grab select-none text-muted-foreground active:cursor-grabbing"
												aria-hidden="true"
											>
												<GripVertical className="h-4 w-4" />
											</span>
											<Checkbox checked={checked} onCheckedChange={value => toggleColumn(key, !!value)} />
											<span className="flex-1 text-sm font-medium text-foreground">{getColumnLabel(col.key, language)}</span>
											<div className="flex flex-col">
												<button
													type="button"
													disabled={index === 0}
													onClick={() => moveColumn(index, -1)}
													aria-label="Move column up"
													className="leading-none text-muted-foreground hover:text-foreground disabled:opacity-25"
												>
													▲
												</button>
												<button
													type="button"
													disabled={index === columnOrder.length - 1}
													onClick={() => moveColumn(index, 1)}
													aria-label="Move column down"
													className="leading-none text-muted-foreground hover:text-foreground disabled:opacity-25"
												>
													▼
												</button>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						<div className="flex shrink-0 gap-4 border-t border-border pt-6">
							<Button className="flex-1" variant="outline" onClick={() => setStep("language")}>
								{t("admin.common.back")}
							</Button>
							<Button
								className="flex-1"
								disabled={selectedColumns.length === 0 || isGeneratingPreview}
								loading={isGeneratingPreview}
								onClick={generatePreview}
							>
								{t("admin.reports.next-preview")}
							</Button>
						</div>
					</div>
				)}

				{step === "preview" && (
					<div className="flex min-h-0 flex-1 flex-col gap-4">
						<div className="flex shrink-0 items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold text-foreground">{t("admin.reports.preview-title")}</h3>
								<p className="text-sm text-muted-foreground">{t("admin.reports.preview-subtitle")}</p>
							</div>
							<span className="rounded-full border border-input bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
								{t("admin.reports.columns-selected-count", {
									count: selectedColumns.length,
									total: OVERDUE_REPORT_COLUMNS.length,
								})}
							</span>
						</div>

						{previewUrl && (
							<iframe
								title="report-preview"
								src={previewUrl}
								className="w-full min-h-0 flex-1 rounded-[6px] border border-input bg-muted/20"
							/>
						)}

						<div className="flex shrink-0 gap-4 border-t border-border pt-6">
							<Button className="flex-1" variant="outline" onClick={() => setStep("columns")}>
								{t("admin.common.back")}
							</Button>
							<Button className="flex-1" onClick={() => setStep("send")}>
								{t("admin.reports.next-send")}
							</Button>
						</div>
					</div>
				)}

				{step === "send" && (
					<div className="flex min-h-0 flex-1 flex-col gap-6">
					<div className="flex-1 overflow-y-auto pr-1">
						<div className="mb-6">
							<h3 className="text-lg font-semibold text-foreground">{t("admin.reports.send-report-title")}</h3>
							<p className="text-sm text-muted-foreground">{t("admin.reports.send-report-subtitle")}</p>
						</div>

						<div className="flex flex-col gap-3">
							<p className="text-sm font-semibold text-foreground">{t("admin.reports.recipients")}</p>

							{(showCollector || showSupplier || showBuyer) && (
								<div className="flex flex-wrap gap-5">
									{showCollector && (
										<RecipientRow
											checked={collector.checked}
											duplicate={isDuplicateEmail(collector.email)}
											email={collector.email}
											emailPlaceholder={t("admin.reports.email-override")}
											facilityName={collectorFacilityName ?? ""}
											isDirect={collectorFacilityName === "Direct"}
											label={t("admin.reports.collector")}
											onCheckedChange={checked => setCollector(prev => ({ ...prev, checked }))}
											onEmailChange={email => setCollector(prev => ({ ...prev, email }))}
										/>
									)}
									{showSupplier && (
										<RecipientRow
											checked={supplier.checked}
											duplicate={isDuplicateEmail(supplier.email)}
											email={supplier.email}
											emailPlaceholder={t("admin.reports.email-override")}
											facilityName={supplierFacilityName ?? ""}
											label={t("admin.reports.supplier")}
											onCheckedChange={checked => setSupplier(prev => ({ ...prev, checked }))}
											onEmailChange={email => setSupplier(prev => ({ ...prev, email }))}
										/>
									)}
									{showBuyer && (
										<RecipientRow
											checked={buyer.checked}
											duplicate={isDuplicateEmail(buyer.email)}
											email={buyer.email}
											emailPlaceholder={t("admin.reports.email-override")}
											facilityName={buyerFacilityName ?? ""}
											label={t("admin.reports.buyer")}
											onCheckedChange={checked => setBuyer(prev => ({ ...prev, checked }))}
											onEmailChange={email => setBuyer(prev => ({ ...prev, email }))}
										/>
									)}
								</div>
							)}

							<div className="max-w-xl rounded-[5px] border border-input bg-white p-5">
								<div className="mb-4 flex items-start justify-between gap-4">
									<div>
										<p className="text-sm font-semibold text-foreground">{t("admin.reports.additional-emails")}</p>
										<p className="mt-0.5 text-xs text-muted-foreground">{t("admin.reports.additional-emails-subtitle")}</p>
									</div>
									<button
										type="button"
										onClick={addCustomEmail}
										className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-primary underline-offset-2 hover:underline"
									>
										<Plus className="h-4 w-4" />
										{t("admin.reports.add-email")}
									</button>
								</div>

								<div className="flex flex-col gap-3">
									{customEmails.map((email, index) => {
										const trimmed = email.trim();
										const isInvalid = !!trimmed && !EMAIL_REGEX.test(trimmed);
										const isDuplicate = !isInvalid && isDuplicateEmail(trimmed);
										const hasError = isInvalid || isDuplicate;
										return (
											<div key={index} className="flex flex-col gap-1">
												<div className="flex items-center gap-3">
													<span className="w-5 shrink-0 text-right text-xs text-muted-foreground">{index + 1}.</span>
													<Input
														className={`h-10 flex-1 text-sm ${hasError ? "border-[#b91c1c] focus-visible:ring-[#b91c1c]" : ""}`}
														placeholder={t("admin.reports.email-placeholder")}
														type="email"
														value={email}
														onChange={e => updateCustomEmail(index, e.target.value)}
													/>
													<button
														type="button"
														aria-label={t("admin.reports.remove-email")}
														disabled={customEmails.length === 1 && !trimmed}
														onClick={() => removeCustomEmail(index)}
														className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] text-muted-foreground transition-colors hover:bg-red-50 hover:text-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
													>
														<X className="h-4 w-4" />
													</button>
												</div>
												{isDuplicate && (
													<p className="ml-8 text-xs font-medium text-[#b91c1c]">
														{t("admin.reports.email-duplicate-error")}
													</p>
												)}
											</div>
										);
									})}
								</div>

								{customEmails.some(email => !!email.trim() && !EMAIL_REGEX.test(email.trim())) && (
									<p className="mt-3 text-xs font-medium text-[#b91c1c]">{t("admin.reports.invalid-email-error")}</p>
								)}
							</div>
						</div>
					</div>

					<div className="flex shrink-0 gap-4 border-t border-border pt-6">
						<Button className="flex-1" variant="outline" onClick={() => setStep("preview")}>
							{t("admin.common.back")}
						</Button>
						<Button className="flex-1" disabled={!canSend || isSending} loading={isSending} onClick={handleSend}>
							{t("admin.reports.send")}
						</Button>
					</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

function Stepper({ currentIndex }: { currentIndex: number }) {
	const { t } = useTranslationContext();

	return (
		<div className="mb-6 flex items-center">
			{STEPS.map((s, i) => {
				const isCompleted = i < currentIndex;
				const isActive = i === currentIndex;
				return (
					<div key={s.key} className="flex flex-1 items-center last:flex-none">
						<div className="flex items-center gap-2">
							<div
								className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
									isCompleted
										? "bg-primary text-primary-foreground"
										: isActive
											? "border-2 border-primary text-primary"
											: "border border-input text-muted-foreground"
								}`}
							>
								{isCompleted ? "✓" : i + 1}
							</div>
							<span className={`text-sm font-medium whitespace-nowrap ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
								{t(s.labelKey as Parameters<typeof t>[0])}
							</span>
						</div>
						{i < STEPS.length - 1 && (
							<div className={`mx-3 h-px flex-1 ${isCompleted ? "bg-primary" : "bg-border"}`} />
						)}
					</div>
				);
			})}
		</div>
	);
}

interface RecipientRowProps {
	label: string;
	facilityName: string;
	email: string;
	emailPlaceholder: string;
	checked: boolean;
	isDirect?: boolean;
	duplicate?: boolean;
	onCheckedChange: (checked: boolean) => void;
	onEmailChange: (email: string) => void;
}

function RecipientRow({
	label,
	facilityName,
	email,
	emailPlaceholder,
	checked,
	isDirect,
	duplicate,
	onCheckedChange,
	onEmailChange,
}: RecipientRowProps) {
	const { t } = useTranslationContext();
	const isEmpty = checked && !email.trim();
	const isDuplicate = checked && !isEmpty && !!duplicate;
	const hasError = (isEmpty && !isDirect) || isDuplicate;
	const showInfo = isEmpty && isDirect;

	return (
		<div
			className={`min-w-[220px] flex-1 basis-[220px] rounded-[5px] border transition-colors ${
				hasError ? "border-[#b91c1c]" : checked ? "border-input bg-white" : "border-input bg-muted/40"
			}`}
		>
			<label htmlFor={`chk-${label}`} className="flex cursor-pointer items-start gap-3 px-5 py-5">
				<Checkbox checked={checked} id={`chk-${label}`} onCheckedChange={value => onCheckedChange(!!value)} className="mt-0.5" />
				<div className="flex min-w-0 flex-col gap-0.5">
					<span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
					<span className={`text-sm font-semibold break-words ${checked ? "text-foreground" : "text-muted-foreground"}`} title={facilityName}>
						{facilityName}
					</span>
				</div>
			</label>

			{checked && (
				<div className={`border-t px-5 py-4 ${hasError ? "border-[#b91c1c] bg-red-50" : "border-input"}`}>
					<Input
						className="h-9 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
						placeholder={emailPlaceholder}
						type="email"
						value={email}
						onChange={e => onEmailChange(e.target.value)}
					/>
					{isDuplicate && (
						<p className="mt-2 text-xs font-medium text-[#b91c1c]">{t("admin.reports.email-duplicate-error")}</p>
					)}
					{isEmpty && !isDirect && (
						<p className="mt-2 text-xs font-medium text-[#b91c1c]">
							{t("admin.reports.email-not-provided-error", { label, facilityName })}
						</p>
					)}
					{showInfo && <p className="mt-2 text-xs font-medium text-blue-600">{t("admin.reports.email-direct-info")}</p>}
				</div>
			)}
		</div>
	);
}