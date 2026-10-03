import { useBuyerCreditInfo } from "@/api/endpoints/entities/buyer";
import { Icon } from "@/components/global/icon";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format-currency";
import { SummaryCard } from "./summary-card";

export const MyOrdersSummary = () => {
	const { data, isLoading } = useBuyerCreditInfo();

	return (
		<Card className="flex w-full items-center justify-between rounded-lg bg-white p-4 py-6 shadow-sm">
			<SummaryCard className="text-3xl" title="Total orders" value="17" />

			<Separator className="mx-4 h-12" orientation="vertical" />

			<SummaryCard className="text-3xl" title="Active orders" value="3" />

			<Separator className="mx-4 h-12" orientation="vertical" />

			<SummaryCard className="text-3xl" title="Remaining Installment" value="8" />

			<Separator className="mx-4 h-12" orientation="vertical" />

			{/* <SummaryCard
				className="text-3xl"
				prefix={<Icon className="h-8 w-8" name="Riyal" />}
				title="Total outstanding"
				value={formatCurrency(data?.results.buyer.outstanding || 0)}
			/> */}

			<Separator className="mx-4 h-12" orientation="vertical" />

			<SummaryCard
				className="text-3xl"
				prefix={<Icon className="h-8 w-8" name="Riyal" />}
				title="Total Overdue Amount"
				value={formatCurrency(15000)}
			/>
		</Card>
	);
};
