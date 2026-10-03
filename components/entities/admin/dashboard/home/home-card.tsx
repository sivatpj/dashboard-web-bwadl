import { cn } from "@/lib/utils";

interface HomeCardProps {
	title: string;
	children: React.ReactNode;
	className?: string;
}

export const HomeCard = (props: HomeCardProps) => {
	const { title, children, className } = props;
	return (
		<div className="flex flex-col gap-1">
			<span className="text-[#404040]">{title}</span>

			<div
				className={cn(
					"rounded-lg border border-[#B4B4B4] px-2 py-4",
					"bg-gradient-to-r from-[#DFF3FE] via-[#D9D9D9] to-[#DFF3FE]",
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
};
