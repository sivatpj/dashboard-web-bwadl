import { useTranslationContext } from "@/contexts/translation";
import { cn } from "@/lib/utils";
import { TailwindIndicator } from "../components/tailwind-indicator";

interface DevHelpersProviderProps {
	children: React.ReactNode;
}

export const DevHelpersProvider = (props: DevHelpersProviderProps) => {
	const { children } = props;

	const { language, changeLanguage, direction } = useTranslationContext();

	if (process.env.NODE_ENV === "production") return children;

	return (
		<>
			<div
				className={cn("fixed bottom-4 z-50 flex flex-col gap-2", {
					"left-4": direction === "rtl",
					"right-4": direction === "ltr",
				})}
			>
				<button
					className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1C1E] p-3 font-mono text-xs text-white shadow-md dark:bg-white dark:text-[#1C1C1E]"
					type="button"
					onClick={() => changeLanguage(language === "ar" ? "en" : "ar")}
				>
					{language === "ar" ? "En" : "ع"}
				</button>
				<TailwindIndicator />
			</div>

			{children}
		</>
	);
};
