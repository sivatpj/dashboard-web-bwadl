import { Filter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Icon } from "@/components/global/icon";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { AddNewInsurer } from "./add-new-insurer";

interface InsurerHeaderProps {}

export const InsurerHeader = (props: InsurerHeaderProps) => {
	const {} = props;

	const { t } = useTranslationContext();

	const params = useSearchParams();
	const setParams = useSetParams();

	const search = params.get("search") || "";

	const setDebouncedSearch = useDebouncedCallback(value => setParams({ search: value }), 1000);

	return (
		<div className="flex w-full items-center gap-8">
			<div className="flex w-full items-center gap-2">
				<Input
					className="h-full w-full text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
					defaultValue={search || ""}
					icon={<Icon className="h-4 w-4" name="Search" />}
					iconPosition="right"
					placeholder={t("admin.insurers.search-insurer-placeholder")}
					type="text"
					onChange={e => setDebouncedSearch(e.target.value)}
				/>

				{/* <Select>
					<SelectTrigger className="flex w-32 items-center gap-2 rounded-sm px-3 text-sm focus:outline-none focus:ring-0">
						<span className="flex items-center gap-2">
							<Filter className="h-4 w-4" />
							<SelectValue placeholder="Filter" />
						</span>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
					</SelectContent>
				</Select> */}
			</div>

			<div className="flex items-center gap-2">
				<AddNewInsurer />
			</div>
		</div>
	);
};
