import { Icon } from "@/components/global/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface TotalLimitProps {
	className?: string;
	totalLimit?: number;
	loading?: boolean;
}

export const TotalLimit = (props: TotalLimitProps) => {
	const { className, totalLimit = 0, loading } = props;

	return (
		<div className={cn("w-full px-6", className)}>
			<h2 className="text-lg font-medium text-gray-600">Credit Limit</h2>

			<div className="flex items-center gap-2 text-5xl font-bold">
				<Icon className="h-8 w-8" name="Riyal" />

				{loading ? <Skeleton className="h-12 w-60" /> : <span>{formatCurrency(totalLimit, true)}</span>}
			</div>
		</div>
	);
};
