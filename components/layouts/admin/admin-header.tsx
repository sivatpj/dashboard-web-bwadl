import { usePathname } from "next/navigation";
import { useState } from "react";
import { useFetchWhoAmI } from "@/api/endpoints/fetch-who-am-i";
import { ChangePasswordDialog } from "@/components/entities/shared/change-password-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuthContext } from "@/contexts/auth";
import { useBreadcrumbsContext } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { Icon } from "../../global/icon";

export const AdminHeader = () => {
	const pathname = usePathname();
	const { logout } = useAuthContext();
	const { breadcrumbs } = useBreadcrumbsContext();
	const { language, changeLanguage, t } = useTranslationContext();
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

	const { data: whoAmIData, isLoading: isWhoAmILoading } = useFetchWhoAmI();

	const blockList: string[] = [];
	if (blockList.includes(pathname) || isWhoAmILoading) return null;

	const name = whoAmIData?.user.nameEn;

	const twoLetterName = name
		?.split(" ")
		.map(part => part.charAt(0).toUpperCase())
		.slice(0, 2)
		.join("");

	return (
		<header className="-mb-8 flex flex-col gap-2 p-4">
			<div className="flex flex-1 items-center justify-between gap-16">
				<div className="flex-1">
					<h1 className="text-2xl">
						<div className="flex items-center gap-8">{breadcrumbs}</div>
					</h1>
				</div>

				<Popover>
					<PopoverTrigger asChild>
						<button aria-label="User menu" className="flex h-full items-center gap-4 outline-none" type="button">
							<hr className="h-full w-[1px] border-t-0 border-t-[#C3C4C5] bg-[#C3C4C5]" />

							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#404040] text-sm font-semibold text-white">
								{twoLetterName}
							</div>
							<div className="text-sm text-muted-foreground">{name}</div>

							<Icon className="h-3 w-3 fill-[#404040]" name="ChevronDownFilled" />
						</button>
					</PopoverTrigger>

					<PopoverContent align="end" className="w-48 p-2">
						<button
							className="mt-1 flex w-full flex-row-reverse items-center justify-between rounded px-2 py-2 text-sm hover:bg-[#F3F4F6]"
							type="button"
							onClick={() => changeLanguage(language === "en" ? "ar" : "en")}
						>
							<span>{language === "en" ? "العربية" : "English"}</span>
							<Icon className="h-4 w-4" name={language === "en" ? "FlagSa" : "FlagUk"} />
						</button>

						<button
							className="flex w-full items-center justify-between rounded px-2 py-2 text-sm hover:bg-[#F3F4F6]"
							type="button"
							onClick={() => setIsChangePasswordOpen(true)}
						>
							<span>{t("admin.header.change-password.title")}</span>
							<Icon className="h-4 w-4 fill-[#404040]" name="Gear" />
						</button>

						<button
							className="flex w-full items-center justify-between rounded px-2 py-2 text-sm hover:bg-[#F3F4F6]"
							type="button"
							onClick={() => logout()}
						>
							<span>{t("admin.header.logout")}</span>
							<Icon className="h-4 w-4 fill-[#404040]" name="SignOut" />
						</button>
					</PopoverContent>
				</Popover>
			</div>

			<hr className="h-[1px] w-full border-t-0 border-t-[#C3C4C5] bg-[#C3C4C5]" />

			<ChangePasswordDialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
		</header>
	);
};
