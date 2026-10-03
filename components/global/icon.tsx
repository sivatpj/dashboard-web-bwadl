import { cn } from "@/lib/utils";
import * as Icons from "./icons";

interface IconProps {
	name: Icons.IconMapping;
	className?: string;
}

export const Icon = (props: IconProps) => {
	const { name, className } = props;

	const Component = Icons[`${name}Icon`];

	if (!Component) return null;

	return (
		<div className={cn("w-4", className)}>
			<Component />
		</div>
	);
};
