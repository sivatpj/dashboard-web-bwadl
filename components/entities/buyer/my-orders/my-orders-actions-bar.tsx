"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Icon } from "@/components/global/icon";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { SliderRange } from "@/components/ui/slider-range";
import { useSetParams } from "@/hooks/use-set-params";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

export const MyOrdersActionsBar = () => {
	const params = useSearchParams();
	const tab = params.get("tab") || "INSTALLMENTS";
	const query = params.get("q") || "";
	const orderStatus = params.get("orderStatus");
	const dateFrom = params.get("dateFrom") || dayjs().subtract(1, "month").toISOString();
	const dateTo = params.get("dateTo") || dayjs().toISOString();
	const installmentFrom = parseInt(params.get("installmentFrom") || "0");
	const installmentTo = parseInt(params.get("installmentTo") || "1356");

	const setParams = useSetParams();

	const debouncedSearch = useDebouncedCallback(q => setParams({ q }), 1000);

	const [installmentRange, setInstallmentRange] = useState([installmentFrom, installmentTo]);
	const debounceRange = useDebouncedCallback((range: number[]) => {
		setParams({ installmentFrom: range[0], installmentTo: range[1] });
	}, 1000);

	useEffect(() => {
		debounceRange(installmentRange);
	}, [installmentRange]);

	const orderStatuses = [
		{ label: "All Orders", value: "ALL_ORDERS" },
		{ label: "Delivery Confirmation", value: "DELIVERY_CONFIRMATION" },
		{ label: "In Progress", value: "IN_PROGRESS" },
		{ label: "Completed", value: "COMPLETED" },
	];

	return (
		<div className="flex w-full items-center gap-2">
			{/* Search */}
			<div className="flex h-11 w-2/4 items-center rounded-md bg-white px-4 text-sm shadow-sm">
				<input
					className="w-full bg-transparent text-sm text-[#404040] placeholder-gray-400 outline-none"
					defaultValue={query}
					placeholder="Search..."
					type="text"
					onChange={e => debouncedSearch(e.target.value)}
				/>
				<Icon className="h-4 w-4" name="Search" />
			</div>

			{/* Right Buttons Group */}
			<div className="flex w-1/2 items-center gap-2">
				{/* Orders + Installments */}
				<div className="flex h-11 w-[95%] flex-[1.2] overflow-hidden rounded-md shadow-sm">
					<button
						type="button"
						className={cn(
							"flex w-1/2 items-center justify-center text-sm font-medium transition-all",
							tab === "ORDERS" ? "bg-black text-white" : "bg-white text-gray-600",
						)}
						onClick={() => setParams({ page: null, tab: "ORDERS" })}
					>
						Orders
					</button>
					<button
						type="button"
						className={cn(
							"flex w-1/2 items-center justify-center text-sm font-medium transition-all",
							tab === "INSTALLMENTS" ? "bg-black text-white" : "bg-white text-gray-600",
						)}
						onClick={() => setParams({ page: null, tab: "INSTALLMENTS" })}
					>
						Installments
					</button>
				</div>

				{/* Filter */}
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="flex h-11 flex-1 items-center justify-between gap-2 rounded-md bg-black px-4 text-sm font-medium text-white shadow-sm"
						>
							<span>Filter</span>
							<img alt="Filter" className="ml-auto h-4 w-4" src="/static/images/whiteFilter.png" />
						</button>
					</PopoverTrigger>

					<PopoverContent className="relative z-10 mt-2 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
						<div>
							<button
								className="float-right px-4 text-xs font-semibold text-gray-900 hover:text-gray-700"
								type="button"
								onClick={() => {
									setParams({
										dateFrom: null,
										dateTo: null,
										installmentFrom: null,
										installmentTo: null,
										orderStatus: null,
									});
									setInstallmentRange([0, 1356]);
								}}
							>
								Clear All
							</button>
						</div>

						<div className="flex gap-8">
							<div className="flex flex-col justify-between pb-4">
								<p className="text-sm font-semibold text-gray-900">Order Status</p>

								<div className="flex flex-col gap-4">
									{orderStatuses.map(status => (
										<div key={status.value} className="flex cursor-pointer items-center space-x-3">
											<Checkbox
												checked={orderStatus === status.value}
												className="h-8 w-8 rounded-sm border-gray-400 data-[state=checked]:border-black data-[state=checked]:bg-black"
												name={status.value}
												onClick={() => setParams({ orderStatus: orderStatus === status.value ? null : status.value })}
											/>

											<label className="text-md text-gray-500" htmlFor={status.value}>
												{status.label}
											</label>
										</div>
									))}
								</div>

								<div className="flex flex-col gap-4">
									<div className="flex items-center justify-between gap-4">
										<p className="text-sm font-semibold text-gray-900">Installment Range</p>
										<span className="w-32 text-right text-sm text-gray-900">
											{formatCurrency(installmentRange[0])} - {formatCurrency(installmentRange[1])} SAR
										</span>
									</div>

									<SliderRange
										className="w-full"
										max={1356}
										min={0}
										step={1}
										value={installmentRange}
										onValueChange={range => setInstallmentRange(range)}
									/>
								</div>
							</div>

							<div className="flex flex-col justify-between gap-4">
								<p className="text-sm font-bold text-[#404040]">Date Range</p>

								<div className="flex w-full items-center justify-center rounded-md border border-[#D1D1D1] bg-white px-3 py-2 text-xs text-gray-500">
									{dayjs(dateFrom).format("DD MMM YYYY")} - {dayjs(dateTo).format("DD MMM YYYY")}
								</div>

								<div className="rounded-md border border-gray-300 bg-white shadow-sm">
									<Calendar
										mode="range"
										selected={{ from: dayjs(dateFrom).toDate(), to: dayjs(dateTo).toDate() }}
										showOutsideDays={false}
										toMonth={dayjs().toDate()}
										onSelect={range =>
											setParams({ dateFrom: dayjs(range?.from).toISOString(), dateTo: dayjs(range?.to).toISOString() })
										}
									/>
								</div>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				{/* Export */}
				<button
					type="button"
					className="flex h-11 flex-1 items-center justify-between gap-2 rounded-md bg-black px-4 text-sm font-medium text-white shadow-sm"
				>
					<span>Export</span>
					<img alt="Export" className="ml-auto h-4 w-4" src="/static/images/whiteExport.png" />
				</button>
			</div>
		</div>
	);
};
