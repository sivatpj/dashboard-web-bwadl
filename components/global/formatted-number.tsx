import { Icon } from "@/components/global/icon";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface FormattedNumberProps {
	value: number | null | undefined;
	className?: string;
}

export const FormattedNumber = (props: FormattedNumberProps) => {
	const { value, className } = props;

	if (value === null || value === undefined) return "-";

	if (!className) return formatCurrency(value, true);

	return <span className={cn(className)}>{formatCurrency(value, true)}</span>;
};
