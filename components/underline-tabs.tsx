import { cn } from "@/lib/utils";

interface UnderlineTabsProps {
	options: Array<{ value: string; label: string }>;
	selected: string;
	onChange: (value: string) => void;
	className?: string;
}

export const UnderlineTabs = (props: UnderlineTabsProps) => {
	const { options, selected, onChange, className } = props;

	return (
		<div className={cn("flex gap-6 border-b border-[#D9D9D9]", className)}>
			{options.map(option => (
				<button
					key={option.value}
					type="button"
					className={cn(
						"pb-2 text-base transition-colors",
						selected === option.value
							? "border-b-4 border-[#2A82BE] font-bold text-[#404040]"
							: "font-medium text-[#8C8C8C] hover:text-[#404040]",
					)}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
};
