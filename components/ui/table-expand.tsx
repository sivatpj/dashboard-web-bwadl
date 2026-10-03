import { ChevronDown, LoaderIcon } from "lucide-react";
import React, { useState } from "react";
import { useTranslationContext } from "@/contexts/translation";
import { cn } from "@/lib/utils";

interface TableExpandColumn<T, K extends keyof T = keyof T> {
	key?: K;
	label: React.ReactNode;
	render?: (value: any, row: T, index: number) => React.ReactNode;
	alignment?: "left" | "right" | "center";
}

export type TableExpandHeaders<T> = TableExpandColumn<T, keyof T>[];

interface TableExpandProps<T> {
	data: T[];
	headers: TableExpandHeaders<T>;
	getRowId: (row: T) => string;
	renderExpandedRow: (row: T) => React.ReactNode;
	loading?: boolean;
	className?: string;
}

export function TableExpand<T>({
	data,
	headers,
	getRowId,
	renderExpandedRow,
	loading,
	className,
}: TableExpandProps<T>) {
	const { t } = useTranslationContext();
	const [expanded, setExpanded] = useState<Set<string>>(new Set());

	const toggle = (id: string) => {
		setExpanded(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	return (
		<div className={cn("flex-1", className)}>
			<table className="w-full">
				<thead>
					<tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
						{headers.map((header, idx) => (
							<th
								key={`header-${idx}`}
								className={cn(
									"px-4 py-3",
									header.alignment === "right" && "text-right",
									header.alignment === "center" && "text-center",
								)}
							>
								{header.label}
							</th>
						))}
						<th className="w-10 px-4 py-3" />
					</tr>
				</thead>
				<tbody>
					{loading ? (
						<tr>
							<td colSpan={headers.length + 1} className="h-24">
								<div className="flex items-center justify-center gap-2 text-[#6B7280]">
									<LoaderIcon className="h-4 w-4 animate-spin" />
									<span>{t("global.loading")}</span>
								</div>
							</td>
						</tr>
					) : (
						data.map((row, idx) => {
							const rowId = getRowId(row);
							const isExpanded = expanded.has(rowId);
							return (
								<React.Fragment key={rowId}>
									<tr
										className="cursor-pointer border-b bg-white text-sm hover:bg-gray-50"
										onClick={() => toggle(rowId)}
									>
										{headers.map((header, colIdx) => {
											const value = header.key ? row[header.key] : undefined;
											return (
												<td
													key={`col-${colIdx}`}
													className={cn(
														"px-4 py-3",
														header.alignment === "right" && "text-right",
														header.alignment === "center" && "text-center",
													)}
												>
													{header.render ? header.render(value, row, idx) : value != null ? String(value) : "-"}
												</td>
											);
										})}
										<td className="px-4 py-3">
											<ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
										</td>
									</tr>
									{isExpanded && (
										<tr className="bg-transparent">
											<td colSpan={headers.length + 1} className="bg-transparent px-8 py-4">
												{renderExpandedRow(row)}
											</td>
										</tr>
									)}
								</React.Fragment>
							);
						})
					)}
				</tbody>
			</table>
		</div>
	);
}
