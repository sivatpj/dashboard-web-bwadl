import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Icon } from "@/components/global/icon";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";
import { UserAddPopUp } from "./user-add-popup";

export const UsersHeader = () => {
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
					placeholder={t("admin.users.search-users-placeholder")}
					type="text"
					onChange={e => setDebouncedSearch(e.target.value)}
				/>
			</div>

			<div className="flex items-center gap-2">
				<UserAddPopUp />
			</div>
		</div>
	);
};
