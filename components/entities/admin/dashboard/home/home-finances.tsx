"use client";

import { getRandomColor } from "hue-hash";
import { LoaderIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { Icon } from "@/components/global/icon";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { cn } from "@/lib/utils";

export const HomeFinances = () => {
	const { data: financiersResp, isLoading } = useFetchFinanciers(
		{ limit: 8, page: 1 },
		{
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000,
		},
	);

	const data = (financiersResp?.financiers || []).map(f => ({
		logo: "/static/assets/temp/arzaq-logo.png",
		name: f.financierName || f.facilityName,
		value: 0,
	}));

	const total = 1;

	const withColors = data.map(d => ({
		...d,
		color: getRandomColor(d.name, { lightness: { max: 50, min: 0 } }),
	}));

	const { t, direction } = useTranslationContext();

	return (
		<div className="relative grid h-full grid-cols-3 rounded-md bg-[#EFF5FA] p-4">
			{isLoading && (
				<div className={`absolute ${direction === "rtl" ? "left-4" : "right-4"} top-4 text-[#404040] opacity-70`}>
					<LoaderIcon className="animate-spin" size={18} />
				</div>
			)}
			<div className={`absolute top-4 z-10 ${direction === "rtl" ? "left-4" : "right-4"}`}>
				<Link className="flex items-center gap-2" href={config.PATHS.dashboard.ADMIN.suppliers}>
					<span className="italic">{t("admin.home.view-all")}</span>
					<Icon className={cn(direction === "rtl" && "rotate-180")} name="CircleArrowRight" />
				</Link>
			</div>

			{/* Left list */}
			<div className="flex flex-col justify-evenly">
				{withColors.slice(0, 3).map((item, idx) => (
					<FinanceItem
						key={idx}
						color={item.color}
						logo={item.logo}
						name={item.name}
						percent={(item.value / total) * 100}
						value={item.value}
					/>
				))}
			</div>

			<div className="flex items-center justify-center">
				<div className="h-[100%] w-[100%]">
					<ResponsiveContainer height="100%" width="100%">
						<PieChart>
							<Pie
								cx="50%"
								cy="50%"
								data={withColors}
								dataKey="value"
								innerRadius={45}
								outerRadius={120}
								paddingAngle={0}
								isAnimationActive
							>
								{withColors.map((entry, idx) => (
									<Cell key={`cell-${idx}`} fill={entry.color} />
								))}
							</Pie>
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className="flex flex-col justify-evenly">
				{withColors.slice(3).map((item, idx) => (
					<FinanceItem
						key={idx}
						color={item.color}
						logo={item.logo}
						name={item.name}
						percent={(item.value / total) * 100}
						value={item.value}
					/>
				))}
			</div>
		</div>
	);
};

interface FinanceItemProps {
	name: string;
	value: number;
	percent: number;
	logo: string;
	color: string;
}

const FinanceItem = ({ name, value, percent, logo, color }: FinanceItemProps) => {
	const percentText = `${percent.toFixed(0)}%`;

	return (
		<div className="flex items-center gap-3">
			<div className="flex-1">
				<div className="flex items-center gap-3">
					<div className="relative h-10 w-10 overflow-hidden rounded">
						<Image alt={name} className="object-contain" src={logo} fill />
					</div>
					<div className="text-xl font-semibold text-black">{name}</div>
				</div>

				<div className="flex items-center gap-4 text-[18px] font-bold text-black">
					<span className="inline-flex items-center gap-2 tabular-nums">
						<Icon name="Riyal" />
						{value.toLocaleString()}
					</span>

					<span className="h-6 w-px bg-gray-500" />

					<span className="tabular-nums">{percentText}</span>
				</div>

				{/* Progress bar with colored dot */}
				<div className="relative h-3 w-full rounded-full bg-gray-300/80">
					<div
						className="h-full rounded-full"
						style={{
							background: color,
							transition: "width 600ms ease",
							width: `${Math.min(Math.max(percent, 0), 100)}%`,
						}}
					/>
				</div>
			</div>
		</div>
	);
};
