import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { AddNewFinancier } from "./add-new-financier";

interface FinancierHeaderProps {}

export const FinancierHeader = (props: FinancierHeaderProps) => {
	const { t } = useTranslationContext();

	// const filterOptions = [
	// 	{ value: "ALL", label: t("admin.suppliers.filter-all") },
	// 	{ value: "BUYER", label: t("admin.suppliers.filter-buyer") },
	// 	{ value: "SELLER", label: t("admin.suppliers.filter-seller") },
	// ];

	const params = useSearchParams();
	const setParams = useSetParams();

	const search = params.get("search") || "";
	// const filter = params.get("filter") || "ALL";

	const setDebouncedSearch = useDebouncedCallback(value => setParams({ search: value }), 1000);

	return (
		<div className="flex w-full items-center gap-8">
			<div className="flex w-full items-center gap-2">
				<Input
					className="h-full w-full text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
					defaultValue={search || ""}
					icon={<Icon className="h-4 w-4" name="Search" />}
					iconPosition="right"
					placeholder={t("admin.financiers.search-placeholder")}
					type="text"
					onChange={e => setDebouncedSearch(e.target.value)}
				/>

				{/* <Select defaultValue={filter} onValueChange={value => setParams({ filter: value })}>
					<SelectTrigger className="flex w-32 items-center gap-2 rounded-sm px-3 text-sm focus:outline-none focus:ring-0">
						<span className="flex items-center gap-2">
							<Icon className="h-4 w-4" name="Filter" />
							<SelectValue placeholder="All" />
						</span>
					</SelectTrigger>

					<SelectContent>
						{filterOptions.map(option => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select> */}
			</div>

			<div className="flex items-center gap-2">
				{/* <Button variant="secondary">
					<Icon className="h-4 w-4" name="Download" />
					{t("admin.suppliers.export")}
				</Button> */}

				<AddNewFinancier />
			</div>
		</div>
	);
};
