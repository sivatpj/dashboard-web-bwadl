"use client";

import { useState } from "react";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { cn } from "@/lib/utils";

interface PaginationProps {
	page?: number | string;
	setPage?: (page: number) => void;
	totalCount?: number;
	perPage?: number;
	setPerPage?: (perPage: number) => void;
	showing?: boolean;
	currentCount?: number;
	pageSizeOptions?: number[];
}

export const Pagination = (props: PaginationProps) => {
	const {
		page: _page = 1,
		perPage,
		setPage,
		setPerPage,
		totalCount,
		showing = false,
		currentCount = 0,
		pageSizeOptions = config.PAGE_SIZE_OPTIONS,
	} = props;

	const { t } = useTranslationContext();

	// Page size options

	// Initialize page size from localStorage or default
	const [selectedPageSize, setSelectedPageSize] = useState(perPage);

	// Handle page size change
	const handlePageSizeChange = (newPageSize: number) => {
		localStorage.setItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE, newPageSize.toString());
		setSelectedPageSize(newPageSize);
		setPerPage?.(newPageSize);
	};

	const totalPages = Math.max(1, Math.ceil((totalCount || 0) / (perPage || 10)));

	const page = Number(_page);

	// Build a compact pagination model like: 1 ... 7 8 9 ... 20
	const items = (() => {
		const result: Array<number | "..."> = [];

		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) result.push(i);
			return result;
		}

		// Always show first & last
		result.push(1);

		// Determine middle window around current page (±1), expanded at edges
		let start = Math.max(2, page - 1);
		let end = Math.min(totalPages - 1, page + 1);

		// When near the start, show more leading pages
		if (page <= 2) {
			start = 2;
			end = Math.min(totalPages - 1, 3);
		}

		// When near the end, show more trailing pages
		if (page >= totalPages - 1) {
			start = Math.max(2, totalPages - 2);
			end = totalPages - 1;
		}

		// Left ellipsis if gap after 1
		if (start > 2) result.push("...");

		for (let i = start; i <= end; i++) result.push(i);

		// Right ellipsis if gap before last
		if (end < totalPages - 1) result.push("...");

		result.push(totalPages);
		return result;
	})();

	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<div className="flex flex-wrap items-center gap-4">
				{showing && (
					<div className="flex flex-wrap gap-1 text-sm font-light text-[#404040]">
						{t("global.pagination.showing")} <span className="font-semibold">{currentCount}</span>
						{t("global.pagination.of")} <span className="font-semibold">{totalCount}</span>
						{t("global.pagination.entries")}
					</div>
				)}

				{setPerPage && (
					<div className="flex items-center gap-2 text-sm text-[#404040]">
						<select
							value={selectedPageSize}
							onChange={e => handlePageSizeChange(Number(e.target.value))}
							className="rounded-[5px] border-[0.5px] border-[#D9D9D9] bg-white px-2 py-1 text-xs focus:border-[#404040] focus:outline-none"
						>
							{pageSizeOptions.map(size => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>
						<span className="text-xs">{t("global.pagination.per-page")}</span>
					</div>
				)}
			</div>

			<div className="flex flex-wrap items-center gap-2 text-xs text-[#404040]">
				<button
					className={cn(
						"flex h-8 w-8 select-none items-center justify-center rounded-[5px] border-[0.5px] border-[#D9D9D9] bg-white text-black hover:bg-gray-100 disabled:opacity-70",
						page === 1 && "pointer-events-none",
					)}
					disabled={page === 1}
					type="button"
					onClick={() => setPage?.(page - 1)}
				>
					{"<"}
				</button>

				{items.map((it, idx) =>
					typeof it === "number" ? (
						<button
							key={it}
							className={cn(
								"flex h-8 w-8 select-none items-center justify-center rounded-[5px] border-[0.5px] border-[#D9D9D9]",
								page === it ? "pointer-events-none bg-[#404040] text-white" : "bg-white text-black hover:bg-gray-100",
								// trailing comma for multiline function args
							)}
							type="button"
							onClick={() => setPage?.(it)}
						>
							{it}
						</button>
					) : (
						<span
							key={`ellipsis-${idx}`}
							className={cn(
								"pointer-events-none flex h-8 w-8 select-none items-center justify-center rounded-[5px] border-[0.5px] border-[#D9D9D9] bg-white text-black transition",
							)}
						>
							...
						</span>
					),
				)}

				<button
					className={cn(
						"flex h-8 w-8 select-none items-center justify-center rounded-[5px] border-[0.5px] border-[#D9D9D9] bg-white text-black hover:bg-gray-100 disabled:opacity-70",
						page === totalPages && "pointer-events-none",
					)}
					disabled={page === totalPages}
					type="button"
					onClick={() => setPage?.(page + 1)}
				>
					{">"}
				</button>
			</div>
		</div>
	);
};
