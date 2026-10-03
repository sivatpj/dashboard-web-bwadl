import { Icon } from "@/components/global/icon";

interface RiyalTitleProps {
	children: React.ReactNode;
}

export const RiyalTitle = (props: RiyalTitleProps) => {
	const { children } = props;

	return (
		<div className="flex items-center gap-1">
			{children}

			<span className="flex items-center text-xs gap-0.5">
				(<Icon className="w-3" name="Riyal" />)
			</span>
		</div>
	);
};
