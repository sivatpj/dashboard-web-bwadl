import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { AddNewSalesOrder } from "@/components/entities/admin/dashboard/invoices/add-new-salesorder";
import { CombinedFiltersRow } from "@/components/global/combined-filters-row";
import { Icon } from "@/components/global/icon";
import { SearchableFilterOption } from "@/components/global/searchable-filter";
import { TabToggle } from "@/components/tab-toggle";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { BuyerAddPopUp } from "./buyer-add-popup";

const INVOICE_STATUSES = ["Overdue", "Ongoing", "Completed"] as const;

const DELIVERY_STATUSES = [
	"not-delivered",
	"partially-delivered",
	"delivered",
	"over-delivered",
	"cancelled",
] as const;

type FilterOptionList = Array<{ id: number; name: string | null }>;

interface BuyersHeaderFilters {
	collectors?: FilterOptionList;
	suppliers?: FilterOptionList;
	financiers?: FilterOptionList;
}

const toFilterOptions = (list?: FilterOptionList): SearchableFilterOption[] =>
	(list ?? []).map(item => ({ id: item.id, name: item.name ?? "" }));

export const BuyersHeader = ({ filters }: { filters?: BuyersHeaderFilters } = {}) => {
	const { t } = useTranslationContext();

	const params = useSearchParams();
	const setParams = useSetParams();
	const router = useRouter();
	const pathname = usePathname();

	const tab = pathname.startsWith("/dashboard/sales-orders")
		? "SALES_ORDERS"
		: pathname.startsWith("/dashboard/invoices")
			? "INVOICES"
			: "BUYERS";
	const tabPaths: Record<string, string> = {
		BUYERS: config.PATHS.dashboard.ADMIN.buyers,
		INVOICES: config.PATHS.dashboard.ADMIN.invoices,
		SALES_ORDERS: config.PATHS.dashboard.ADMIN.salesOrders,
	};

	const search = params.get("search") || "";
	const status = params.get("status") || "";
	const deliveryStatus = params.get("deliveryStatus") || "";
	const collectorId = params.get("collectorId") ? Number(params.get("collectorId")) : undefined;
	const supplierId = params.get("supplierId") ? Number(params.get("supplierId")) : undefined;
	const financierId = params.get("financierId") ? Number(params.get("financierId")) : undefined;

	const setDebouncedSearch = useDebouncedCallback(value => setParams({ page: null, search: value }), 1000);

	const filterFields =
		tab === "SALES_ORDERS" || tab === "INVOICES"
			? [
					{
						key: "collectorId" as const,
						label: t("admin.reports.collector"),
						options: toFilterOptions(filters?.collectors),
						placeholder: t("admin.reports.collector-placeholder"),
						selectedId: collectorId,
					},
					{
						key: "supplierId" as const,
						label: t("admin.reports.supplier"),
						options: toFilterOptions(filters?.suppliers),
						placeholder: t("admin.reports.supplier-placeholder"),
						selectedId: supplierId,
					},
					{
						key: "financierId" as const,
						label: t("admin.reports.financier"),
						options: toFilterOptions(filters?.financiers),
						placeholder: t("admin.reports.financier-placeholder"),
						selectedId: financierId,
					},
				]
			: [];

	if (tab === "BUYERS") {
		return (
			<div className="flex w-full items-center gap-8">
				<div className="flex w-full items-center gap-2">
					<Input
						className="h-full w-full text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
						defaultValue={search || ""}
						icon={<Icon className="h-4 w-4" name="Search" />}
						iconPosition="right"
						placeholder={t("admin.buyers.search-placeholder")}
						type="text"
						onChange={e => setDebouncedSearch(e.target.value)}
					/>
				</div>

				<TabToggle
					options={[
						{ label: t("admin.buyers.buyers"), value: "BUYERS" },
						{ label: t("admin.common.sales"), value: "SALES_ORDERS" },
						{ label: t("admin.buyers.invoices"), value: "INVOICES" },
					]}
					selected={tab}
					onChange={value => router.push(tabPaths[value] ?? config.PATHS.dashboard.ADMIN.buyers)}
				/>

				<div className="flex items-center gap-2">
					<BuyerAddPopUp />
				</div>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-wrap items-end gap-2">
			<div className="flex flex-1 flex-wrap items-end gap-2">
				<div className="flex min-w-[360px] flex-1 flex-col gap-1">
					<label className="invisible text-sm text-[#404040]">{t("admin.reports.search")}</label>
					<Input
						className="h-12 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
						defaultValue={search || ""}
						icon={<Icon className="h-4 w-4" name="Search" />}
						iconPosition="right"
						placeholder={
							tab === "SALES_ORDERS"
								? t("admin.buyers.search-sales-order-placeholder")
								: t("admin.buyers.search-invoice-placeholder")
						}
						type="text"
						onChange={e => setDebouncedSearch(e.target.value)}
					/>
				</div>

				{filterFields.length > 0 && <CombinedFiltersRow fields={filterFields} />}
			</div>

			<div className="flex shrink-0 flex-wrap items-end gap-2">
				{tab === "SALES_ORDERS" && (
					<Select
						className="w-auto shrink-0"
						value={deliveryStatus || "all"}
						onValueChange={value => setParams({ deliveryStatus: value === "all" ? null : value, page: null })}
					>
						<SelectTrigger className="h-12 w-auto min-w-[160px]">
							<SelectValue placeholder={t("admin.suppliers.delivery-status")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t("admin.common.all")}</SelectItem>
							{DELIVERY_STATUSES.map(s => (
								<SelectItem key={s} value={s}>
									{s === "cancelled" ? t("admin.sales-orders.status-cancelled") : t(`admin.sales-orders.${s}`)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}

				<TabToggle
					className="h-12"
					options={[
						{ label: t("admin.buyers.buyers"), value: "BUYERS" },
						{ label: t("admin.common.sales"), value: "SALES_ORDERS" },
						{ label: t("admin.buyers.invoices"), value: "INVOICES" },
					]}
					selected={tab}
					onChange={value => router.push(tabPaths[value] ?? config.PATHS.dashboard.ADMIN.buyers)}
				/>

				{tab === "INVOICES" && (
					<Select
						className="w-auto shrink-0"
						value={status || "all"}
						onValueChange={value => setParams({ page: null, status: value === "all" ? null : value })}
					>
						<SelectTrigger className="h-12 w-auto min-w-[120px]">
							<SelectValue placeholder={t("admin.buyers.sort-by-status")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t("admin.common.all")}</SelectItem>
							{INVOICE_STATUSES.map(s => (
								<SelectItem key={s} value={s}>
									{t(`admin.common.invoice-status-enum.${s}`)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}

				{tab === "SALES_ORDERS" && <AddNewSalesOrder />}
			</div>
		</div>
	);
};
