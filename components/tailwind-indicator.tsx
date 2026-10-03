import { useBreakpoint } from "@/hooks/use-breakpoint";

export function TailwindIndicator() {
	const breakpoint = useBreakpoint();

	if (process.env.NODE_ENV === "production") return null;

	return (
		<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1C1E] p-3 font-mono text-xs text-white shadow-md dark:bg-white dark:text-[#1C1C1E]">
			{breakpoint}
		</div>
	);
}
