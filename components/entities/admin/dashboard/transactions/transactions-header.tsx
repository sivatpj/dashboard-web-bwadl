import dayjs from "dayjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

interface TransactionsHeaderProps {}

export const TransactionsHeader = (props: TransactionsHeaderProps) => {
	const {} = props;

	const params = useSearchParams();
	const setParams = useSetParams();
	const { t } = useTranslationContext();

	const debouncedFromDate = params.get("from") || undefined;

	const debouncedToDate = params.get("to") || undefined;

	const search = params.get("search") || "";
	const exactRef = params.get("exactRef") || "";

	const setDebouncedSearch = useDebouncedCallback(value => setParams({ page: null, search: value }), 1000);
	const setDebouncedExactRef = useDebouncedCallback(value => setParams({ page: null, exactRef: value || null }), 500);

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
	const [toDate, setToDate] = useState<Date | undefined>(debouncedToDate ? dayjs(debouncedToDate).toDate() : undefined);

	return (
		<div className="flex items-center justify-between">
			<div className="flex h-full gap-4">
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

			<div className="flex w-[50%] gap-2">
				<Input
					className="w-3/5"
					defaultValue={search}
					icon={<Icon className="h-4 w-4" name="Search" />}
					iconPosition="right"
					placeholder={t("admin.transactions.search-placeholder")}
					type="text"
					onChange={e => setDebouncedSearch(e.target.value)}
				/>
				<Input
					className="w-2/5"
					defaultValue={exactRef}
					icon={<Icon className="h-4 w-4" name="Search" />}
					iconPosition="right"
					placeholder="Exact reference"
					type="text"
					onChange={e => setDebouncedExactRef(e.target.value)}
				/>
			</div>

			<Link href={config.PATHS.dashboard.ADMIN.accountingEvents}>
				<Button>
					<Icon className="h-4 w-4 fill-white" name="ClipboardCheck" />
					Events
				</Button>
			</Link>
		</div>
	);
};
