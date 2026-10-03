import { cn } from "@/lib/utils";

interface TabToggleProps {
	options: Array<{ value: string; label: string }>;
	selected: string;
	onChange: (value: string) => void;
	className?: string;
}

export const TabToggle = (props: TabToggleProps) => {
	const { options, selected, onChange, className } = props;

	return (
		<div className={cn("flex h-full rounded-[5px] border-[0.5px] border-[#D9D9D9] bg-white p-1 text-sm", className)}>
			{options.map(option => (
				<button
					key={option.value}
					className={cn(
						"flex items-center justify-center rounded-[5px] px-6 transition-all",
						selected === option.value ? "bg-[#404040] font-semibold text-white" : "bg-white text-black",
					)}
					type="button"
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
};
