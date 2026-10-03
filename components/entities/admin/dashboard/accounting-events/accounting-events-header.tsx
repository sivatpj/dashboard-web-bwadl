import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Icon } from "@/components/global/icon";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

const STATUS_OPTIONS = ["All", "New", "Processing", "Succeeded", "Failed", "Disabled"] as const;

export const AccountingEventsHeader = () => {
	const params = useSearchParams();
	const setParams = useSetParams();
	const { t } = useTranslationContext();

	const debouncedFromDate = params.get("from") || undefined;
	const debouncedToDate = params.get("to") || undefined;
	const search = params.get("search") || "";
	const status = params.get("status") || "All";

	const setDebouncedSearch = useDebouncedCallback(
		value => setParams({ page: null, search: value }),
		1000,
	);

	const setDebouncedFromDate = useDebouncedCallback(
		value =>
			setParams({
				from: value ? dayjs(value).format("YYYY-MM-DD") : undefined,
				page: null,
			}),
		500,
	);

	const setDebouncedToDate = useDebouncedCallback(
		value =>
			setParams({
				page: null,
				to: value ? dayjs(value).format("YYYY-MM-DD") : undefined,
			}),
		500,
	);

	const [fromDate, setFromDate] = useState<Date | undefined>(
		debouncedFromDate ? dayjs(debouncedFromDate).toDate() : undefined,
	);
	const [toDate, setToDate] = useState<Date | undefined>(
		debouncedToDate ? dayjs(debouncedToDate).toDate() : undefined,
	);

	return (
		<div className="flex items-center justify-between">
			<div className="flex h-full items-center gap-4">
				<Select
					value={status}
					onValueChange={value => setParams({ page: null, status: value === "All" ? null : value })}
				>
					<SelectTrigger className="h-[42px] w-[160px]">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						{STATUS_OPTIONS.map(s => (
							<SelectItem key={s} value={s}>
								{s}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Popover>
					<PopoverTrigger asChild>
						<button
							className="flex items-center justify-between gap-16 rounded-sm border bg-white px-4 py-2 shadow-sm"
							type="button"
						>
							<span className="text-sm text-muted-foreground">
								{fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : "__/__/__"}
							</span>
							<Icon className="h-4 w-4" name="Calendar" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							disabled={toDate ? date => date > toDate : undefined}
							mode="single"
							selected={fromDate}
							onSelect={date => {
								setFromDate(date);
								setDebouncedFromDate(date);
							}}
						/>
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger asChild>
						<button
							className="flex items-center justify-between gap-16 rounded-sm border bg-white px-4 py-2 shadow-sm"
							type="button"
						>
							<span className="text-sm text-muted-foreground">
								{toDate ? dayjs(toDate).format("DD/MM/YYYY") : "__/__/__"}
							</span>
							<Icon className="h-4 w-4" name="Calendar" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							disabled={fromDate ? date => date < fromDate : undefined}
							mode="single"
							selected={toDate}
							initialFocus
							onSelect={date => {
								setToDate(date);
								setDebouncedToDate(date);
							}}
						/>
					</PopoverContent>
				</Popover>
			</div>

			<Input
				className="w-[50%]"
				defaultValue={search}
				icon={<Icon className="h-4 w-4" name="Search" />}
				iconPosition="right"
				placeholder={t("admin.accounting-events.search-placeholder")}
				type="text"
				onChange={e => setDebouncedSearch(e.target.value)}
			/>
		</div>
	);
};
