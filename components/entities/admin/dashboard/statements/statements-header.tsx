import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Icon } from "@/components/global/icon";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

interface StatementsHeaderProps {}

export const StatementsHeader = (props: StatementsHeaderProps) => {
	const {} = props;

	const params = useSearchParams();
	const setParams = useSetParams();
	const { t } = useTranslationContext();

	const search = params.get("search") || "";

	const setDebouncedSearch = useDebouncedCallback(value => setParams({ page: null, search: value }), 1000);

	return (
		<div className="flex items-center justify-between">
			<Input
				className="w-[50%]"
				defaultValue={search}
				icon={<Icon className="h-4 w-4" name="Search" />}
				iconPosition="right"
				placeholder={t("admin.statements.search-placeholder")}
				type="text"
				onChange={e => setDebouncedSearch(e.target.value)}
			/>
		</div>
	);
};
