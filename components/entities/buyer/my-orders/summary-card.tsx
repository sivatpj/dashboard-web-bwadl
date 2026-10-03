import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
	title: string;
	value: string;
	postfix?: React.ReactNode;
	prefix?: React.ReactNode;
	className?: string;
}

export function SummaryCard(props: SummaryCardProps) {
	const { title, value, postfix, prefix, className } = props;
	return (
		<Card className="w-full border-none bg-transparent shadow-none">
			<CardContent className="flex flex-col items-start justify-center gap-2 p-0 text-center">
				<h3 className="text-sm text-gray-500">{title}</h3>
				<div className="flex items-center gap-2">
					{prefix}

					<p className={cn("text-2xl font-semibold", className)}>{value}</p>

					{postfix}
				</div>
			</CardContent>
		</Card>
	);
}
