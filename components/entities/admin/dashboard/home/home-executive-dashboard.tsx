import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useDashboard } from "@/api/endpoints/back-office/dashboard";
import { Icon } from "@/components/global/icon";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useTranslationContext } from "@/contexts/translation";
import { formatCurrency } from "@/lib/format-currency";
import { formatNumber } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { HomeCard } from "./home-card";

const ChartTooltipContent = ({ active, payload }: any) => {
	if (active && payload?.length) {
		return (
			<div className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow">
				{payload[0].value}
			</div>
		);
	}

	return null;
};

export const HomeExecutiveDashboard = () => {
	const { data, isLoading } = useDashboard();
	const { t } = useTranslationContext();

	if (isLoading || !data) {
		return (
			<div className="grid grid-cols-4 gap-12 rounded-md bg-[#EFF5F9] p-4">
				{/* 4 top stat cards */}
				{[0, 1, 2, 3].map(i => (
					<div key={i} className="flex flex-col gap-2 rounded-md bg-white/60 p-4 shadow-sm">
						<div className="h-4 w-28 rounded bg-gray-300" />
						<div className="mt-2 flex items-center gap-2">
							<div className="h-6 w-6 rounded-full bg-gray-300" />
							<div className="h-8 w-24 rounded bg-gray-300" />
						</div>
					</div>
				))}

				<div className="col-span-1 flex flex-col gap-3 rounded-md bg-white/60 p-4 shadow-sm">
					<div className="h-4 w-28 rounded bg-gray-300" />
					<div className="flex items-center justify-between gap-2 px-2">
						<div className="h-8 w-16 rounded bg-gray-300" />
						<div className="h-8 w-24 rounded bg-gray-300" />
					</div>
					<div className="h-36 rounded bg-gray-200" />
				</div>

				{/* Capital card */}
				<div className="flex flex-col gap-3 rounded-md bg-white/60 p-4 shadow-sm">
					<div className="h-4 w-28 rounded bg-gray-300" />
					<div className="mt-2 flex items-center gap-2">
						<div className="h-6 w-6 rounded-full bg-gray-300" />
						<div className="h-8 w-24 rounded bg-gray-300" />
					</div>
					<div className="h-36 rounded bg-gray-200" />
				</div>

				<div className="flex flex-col gap-3 rounded-md bg-white/60 p-4 shadow-sm">
					<div className="h-4 w-28 rounded bg-gray-300" />
					<div className="h-36 rounded-full bg-gray-200" />
				</div>

				{/* Total buyers chart */}
				<div className="col-span-1 flex flex-col gap-3 rounded-md bg-white/60 p-4 shadow-sm">
					<div className="h-4 w-28 rounded bg-gray-300" />
					<div className="flex items-center justify-between gap-2 px-2">
						<div className="h-8 w-16 rounded bg-gray-300" />
						<div className="h-8 w-24 rounded bg-gray-300" />
					</div>
					<div className="h-36 rounded bg-gray-200" />
				</div>
			</div>
		);
	}

	const ordersData = data.data.invoicesPerMonth.map(item => ({
		month: item.month,
		value: 0,
	}));

	const lastMonthOrders = 0;
	const ordersPercentageChange = 0;

	const buyersData = data.data.buyersPerMonth.map(item => ({
		month: item.month,
		value: 0,
	}));

	const lastMonthBuyers = 0;
	const buyersPercentageChange = 0;

	const chartConfig = {
		value: {
			color: "#000000",
			label: "",
		},
	} satisfies ChartConfig;

	return (
		<div className="grid grid-cols-4 gap-12 rounded-md bg-[#EFF5F9] p-4">
			<HomeCard className="flex items-center gap-2" title={t("admin.home.financed-amount")}>
				<Icon className="fill-[#404040]" name="Riyal" />
				<span className="text-3xl font-bold text-[#404040]">{formatCurrency(0, true)}</span>
			</HomeCard>

			<HomeCard className="flex items-center gap-2" title={t("admin.home.collected-amount")}>
				<Icon className="fill-[#404040]" name="Riyal" />
				<span className="text-3xl font-bold text-[#404040]">{formatCurrency(0, true)}</span>
			</HomeCard>

			<HomeCard className="flex items-center gap-2" title={t("admin.home.actual-balance")}>
				<Icon className="fill-[#404040]" name="Riyal" />
				<span className="text-3xl font-bold text-[#404040]">{formatCurrency(0, true)}</span>
			</HomeCard>

			<HomeCard className="flex items-center gap-2" title={t("admin.home.bank-balance")}>
				<Icon className="fill-[#404040]" name="Riyal" />
				<span className="text-3xl font-bold text-[#404040]">{formatCurrency(0, true)}</span>
			</HomeCard>

			<HomeCard className="flex flex-col gap-2" title={t("admin.home.new-orders")}>
				<div className="flex items-center justify-between gap-2 px-2">
					<span className="text-3xl font-bold text-[#404040]">{lastMonthOrders}</span>
					<div
						className={cn(
							ordersPercentageChange > 0 ? "bg-[#E1FCEF]" : "bg-[#FFDBDB]",
							"flex gap-1 rounded-lg px-4 py-2",
						)}
					>
						{ordersPercentageChange > 0 ? (
							<Icon className="fill-[#38A06C]" name="ArrowUp" />
						) : (
							<Icon className="fill-[#FF0000]" name="ArrowDown" />
						)}
						<span
							className={cn(
								ordersPercentageChange > 0 ? "text-[#38A06C]" : "text-[#FF0000]",
								"text-xs font-bold italic",
							)}
						>
							{Math.abs(ordersPercentageChange).toFixed(2)}%
						</span>
					</div>
				</div>

				<div className="flex h-36 flex-col px-4">
					<ChartContainer className="pt-8" config={chartConfig}>
						<AreaChart data={ordersData} margin={{ left: 12, right: 12 }}>
							<CartesianGrid vertical={false} />
							<XAxis
								axisLine={false}
								dataKey="month"
								tick={{ fill: "#000", fontSize: 10, fontStyle: "italic", fontWeight: 500 }}
								tickLine={false}
							/>

							<ChartTooltip content={<ChartTooltipContent />} />

							<defs>
								<linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
									<stop offset="0%" stopColor="#5E7386" />
									<stop offset="100%" stopColor="#A6CAEC00" />
								</linearGradient>
							</defs>

							<Area dataKey="value" fill="url(#areaGradient)" fillOpacity={1} stroke="#000000" type="linear" />
						</AreaChart>
					</ChartContainer>
				</div>
			</HomeCard>

			<HomeCard className="flex flex-col gap-2" title={t("admin.home.capital")}>
				<div className="flex items-center gap-2">
					<Icon className="fill-[#404040]" name="Riyal" />
					<span className="text-3xl font-bold text-[#404040]">{formatCurrency(0, true)}</span>
				</div>

				<div className="flex h-36 flex-col px-4">
					<div className="flex flex-1 items-end justify-center gap-8 border-b border-l border-[#B4B4B4]">
						<div className="flex h-full flex-col items-center justify-end">
							<div className="flex gap-1">
								<Icon className="w-3 fill-[#404040]" name="Riyal" />
								<span className="text-xs font-bold italic text-[#404040]">{formatCurrency(0, true)}</span>
							</div>

							<div
								className={cn(
									"w-16",
									"rounded-t-xl border border-b-0 border-[#B4B4B4]",
									"bg-gradient-to-r from-[#00B80C80] via-[#97DF9C] to-[#00B80C80]",
								)}
								style={{
									flex: 1,
								}}
							/>
						</div>

						<div className="flex h-full flex-col items-center justify-end">
							<div className="flex gap-1">
								<Icon className="w-3 fill-[#404040]" name="Riyal" />
								<span className="text-xs font-bold italic text-[#404040]">{formatCurrency(0, true)}</span>
							</div>

							<div
								className={cn(
									"w-16",
									"rounded-t-xl border border-b-0 border-[#B4B4B4]",
									"bg-gradient-to-r from-[#FF5B5B] via-[#FF9395] to-[#FF5B5B]",
								)}
								style={{
									flex: 1,
								}}
							/>
						</div>
					</div>

					<div className="flex items-end gap-8 px-4">
						<span className="flex-1 text-center text-sm italic text-[#404040]">Available</span>
						<span className="flex-1 text-center text-sm italic text-[#404040]">Used</span>
					</div>
				</div>
			</HomeCard>

			<HomeCard className="flex flex-col gap-2" title={t("admin.home.revenue")}>
				<div className="flex items-center gap-2">
					<Icon className="fill-[#404040]" name="Riyal" />
					<span className="text-3xl font-bold text-[#404040]">{formatCurrency(0, true)}</span>
				</div>

				<div className="flex h-36 justify-center">
					<div className="flex aspect-square flex-1 flex-col items-center justify-center rounded-full">
						<div className="flex aspect-square flex-1 flex-col items-center justify-center rounded-full bg-[#38A06C1A] pt-2">
							<span className="text-xs font-bold italic text-[#404040]">{formatNumber(0)}</span>

							<div className="flex aspect-square flex-1 flex-col items-center justify-center rounded-full bg-[#38A06C66] pt-2">
								<span className="text-xs font-bold italic text-[#404040]">{formatNumber(0)}</span>

								<div className="flex aspect-square flex-1 flex-col items-center justify-center rounded-full bg-[#38A06CB2] pt-2">
									<span className="text-xs font-bold italic text-[#404040]">{formatNumber(0)}</span>

									<div className="flex aspect-square flex-1 flex-col items-center rounded-full bg-[#38A06C] pt-2">
										<span className="text-xs font-bold italic text-[#404040]">{formatNumber(0)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</HomeCard>

			<HomeCard className="flex flex-col gap-2" title={t("admin.home.total-buyers")}>
				<div className="flex items-center justify-between gap-2 px-2">
					<span className="text-3xl font-bold text-[#404040]">{lastMonthBuyers}</span>
					<div
						className={cn(
							buyersPercentageChange > 0 ? "bg-[#E1FCEF]" : "bg-[#FFDBDB]",
							"flex gap-1 rounded-lg px-4 py-2",
						)}
					>
						{buyersPercentageChange > 0 ? (
							<Icon className="fill-[#38A06C]" name="ArrowUp" />
						) : (
							<Icon className="fill-[#FF0000]" name="ArrowDown" />
						)}
						<span
							className={cn(
								buyersPercentageChange > 0 ? "text-[#38A06C]" : "text-[#FF0000]",
								"text-xs font-bold italic",
							)}
						>
							{Math.abs(buyersPercentageChange).toFixed(2)}%
						</span>
					</div>
				</div>

				<div className="flex h-36 flex-col px-4">
					<ChartContainer className="pt-8" config={chartConfig}>
						<AreaChart data={buyersData} margin={{ left: 12, right: 12 }}>
							<CartesianGrid vertical={false} />
							<XAxis
								axisLine={false}
								dataKey="month"
								tick={{ fill: "#000", fontSize: 10, fontStyle: "italic", fontWeight: 500 }}
								tickLine={false}
							/>

							<ChartTooltip content={<ChartTooltipContent />} />

							<defs>
								<linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
									<stop offset="0%" stopColor="#5E7386" />
									<stop offset="100%" stopColor="#A6CAEC00" />
								</linearGradient>
							</defs>

							<Area dataKey="value" fill="url(#areaGradient)" fillOpacity={1} stroke="#000000" type="linear" />
						</AreaChart>
					</ChartContainer>
				</div>
			</HomeCard>
		</div>
	);
};
