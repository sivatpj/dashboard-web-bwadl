import { LoaderIcon, MoreVertical } from "lucide-react";
import * as React from "react";
import { Icon } from "@/components/global/icon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslationContext } from "@/contexts/translation";
import { cn } from "@/lib/utils";

interface Column<T, K extends keyof T = keyof T> {
	key?: K;
	label: React.ReactNode;
	render?: (value: any, row: T, index: number) => React.ReactNode;
	sortable?: boolean;
	alignment?: "left" | "right" | "center";
	warningLogic?: (row: T) => boolean;
	nowrap?: boolean;
	/** Draws a divider after this column, useful to visually separate logical column groups. */
	groupEnd?: boolean;
}

export type DataTableHeaders<T> = Column<T, keyof T>[];

export interface DataTableGroupHeader {
	label: React.ReactNode;
	span: number;
}

interface DataTableProps<T> {
	data?: T[];
	headers: DataTableHeaders<T>;
	/** Renders a super-header row above the column headers, grouping columns under section labels. */
	groupHeaders?: DataTableGroupHeader[];
	/** Keeps the first column pinned while the rest of a wide table scrolls horizontally. */
	stickyFirstColumn?: boolean;
	striped?: boolean;
	onClick?: (row: T) => void;
	onOpen?: (row: T) => void;
	onEdit?: (row: T) => void;
	renderEditAction?: (row: T) => React.ReactNode;
	onDelete?: (row: T) => void;
	deleteLabel?: React.ReactNode;
	renderDeleteAction?: (row: T) => React.ReactNode;
	isRowClickable?: (row: T) => boolean;
	hasRowActions?: (row: T) => boolean;
	className?: string;
	loading?: boolean;
	onSortBy?: (key: any, dir: "asc" | "desc") => void;
	sortOrder?: "asc" | "desc";
	sortKey?: string;
	emptyMessage?: React.ReactNode;
}

export function DataTable<T>(props: DataTableProps<T>) {
	const {
		sortOrder,
		sortKey,
		onSortBy,
		data = [],
		headers,
		groupHeaders,
		stickyFirstColumn,
		striped,
		onClick,
		onOpen,
		onEdit,
		renderEditAction,
		onDelete,
		deleteLabel,
		renderDeleteAction,
		isRowClickable,
		hasRowActions,
		className,
		loading = false,
		emptyMessage,
	} = props;

	const { t } = useTranslationContext();

	const hasActions = !!(onOpen || onEdit || renderEditAction || onDelete || renderDeleteAction);
	const runActionWithoutRowClick = (action: () => void) => {
		if (typeof document !== "undefined") {
			document.body.setAttribute("data-ignore-row-active", "");
			window.setTimeout(() => {
				document.body.removeAttribute("data-ignore-row-active");
			}, 250);
		}
		action();
	};

	return (
		<div className={cn(className)}>
			<div className={cn("w-full overflow-x-auto rounded-t-[5px] text-sm")}>
				<table className="w-full border-collapse">
					<thead className="bg-gray-200 text-black">
						{groupHeaders && (
							<tr className="h-9 bg-[#EEF1F4] text-xs ltr:text-left rtl:text-right">
								<th className="w-1 p-0" />
								{groupHeaders.map((group, idx) => (
									<th
										key={`group-header-${idx}`}
										className={cn(
											idx === 0 ? "pl-6" : "px-4",
											"border-b border-[#E5E7EB] font-semibold uppercase tracking-wide text-gray-500",
											idx < groupHeaders.length - 1 && "border-r border-[#E5E7EB]",
										)}
										colSpan={group.span}
									>
										{group.label}
									</th>
								))}
								{hasActions && <th className="w-10 border-b border-[#E5E7EB]" />}
							</tr>
						)}
						<tr className="h-12 bg-[#F6F8FA] text-sm ltr:text-left rtl:text-right">
							<th className={cn("w-1 p-0", stickyFirstColumn && "sticky left-0 z-[1] bg-[#F6F8FA]")}>
								<div className="h-full w-1 rounded-l bg-[#4B9CC5]" />
							</th>
							{headers.map((header, idx) => {
								const isActive = sortKey === header.key;
								return (
									<th
										key={`header-${idx}`}
										className={cn(
											idx === 0 ? "pl-6" : "px-4",
											"select-none font-semibold",
											header.sortable ? "cursor-pointer" : "cursor-default",
											header.alignment === "right"
												? "text-right"
												: header.alignment === "center"
													? "text-center"
													: "text-left",
											header.groupEnd && "border-r border-[#E5E7EB]",
											idx === 0 && stickyFirstColumn && "sticky left-1 z-[1] bg-[#F6F8FA]",
										)}
										onClick={() => {
											if (!header.sortable) return;
											const dir = sortOrder === "asc" ? "desc" : "asc";
											onSortBy?.(header.key, dir);
										}}
									>
										<span className="inline-flex items-center gap-1">
											{header.label}
											{header.sortable && (
												<span className={cn("text-[10px] opacity-50", isActive ? "opacity-100" : "")}>
													{sortOrder === "asc" ? "▼" : "▲"}
												</span>
											)}
										</span>
									</th>
								);
							})}
							{hasActions && <th className="w-10" />}
						</tr>
					</thead>

					<tbody className="bg-white">
						{loading ? (
							<tr>
								<td className="h-24" colSpan={headers.length + 2 + (hasActions ? 1 : 0)}>
									<div className="flex items-center justify-center gap-2 text-[#6B7280]">
										<LoaderIcon className="h-4 w-4 animate-spin" />
										<span>{t("global.loading")}</span>
									</div>
								</td>
							</tr>
						) : (
							<>
								{data.filter((row): row is T => row != null).length === 0 && emptyMessage && (
									<tr>
										<td className="h-24 text-center text-sm text-gray-500" colSpan={headers.length + 2 + (hasActions ? 1 : 0)}>
											{emptyMessage}
										</td>
									</tr>
								)}
								{data.filter((row): row is T => row != null).map((row, idx) => {
									const rowBg = striped && idx % 2 === 1 ? "bg-[#FAFBFC]" : "bg-white";
									return (
									<tr
										key={`row-${idx}-${JSON.stringify(row)}`}
										className={cn(
											"h-14 border-t border-[#F6F8FA]",
											rowBg,
											onClick && (isRowClickable?.(row) ?? true) ? "cursor-pointer hover:bg-gray-100" : "",
										)}
										onClick={e => {
											if (!(isRowClickable?.(row) ?? true)) {
												return;
											}
											const target = e.target as HTMLElement | null;
											if (typeof document !== "undefined") {
												if (document.body.hasAttribute("data-ignore-row-active")) {
													return;
												}
											}
											if (target?.closest?.("[data-ignore-row]")) {
												return;
											}
											onClick?.(row);
										}}
									>
										<td className={cn("w-1 p-0", stickyFirstColumn && cn("sticky left-0 z-[1]", rowBg))}>
											<div className="h-full w-1 bg-[#4B9CC5]" />
										</td>
										{headers.map((header, colIdx) => {
											const isError = header.warningLogic?.(row) || false;

											const value = header.key ? row[header.key] : undefined;
											return (
												<td
													key={`row-${idx}-col-${colIdx}`}
													className={cn(
														colIdx === 0 ? "pl-6" : "px-4",
														header.alignment === "right"
															? "text-right"
															: header.alignment === "center"
																? "text-center"
																: "text-left",
														header.nowrap && "whitespace-nowrap",
														header.groupEnd && "border-r border-[#F0F2F4]",
														colIdx === 0 && stickyFirstColumn && cn("sticky left-1 z-[1]", rowBg),
													)}
												>
													<div className="inline-flex justify-between gap-2 items-center">
														{isError && <Icon className="size-4 fill-[#FF5C5B]" name="Warning" />}

														{header.render ? header.render(value, row, idx) : value != null ? String(value) : "-"}
													</div>
												</td>
											);
										})}
										{hasActions && (hasRowActions?.(row) ?? true) && (
											<td className="w-10 text-center" data-ignore-row>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<button
															className="inline-flex items-center justify-center rounded-md p-1 hover:bg-gray-100"
															type="button"
															onClick={event => event.stopPropagation()}
															onMouseDown={event => event.stopPropagation()}
															onPointerDown={event => event.stopPropagation()}
														>
															<MoreVertical className="h-4 w-4 text-gray-500" />
														</button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end" className="min-w-[160px]">
														{onOpen && (
															<DropdownMenuItem
																className="flex items-center gap-3 px-4 py-2.5"
																onClick={event => event.stopPropagation()}
																onPointerDown={event => event.stopPropagation()}
																onSelect={event => {
																	event.stopPropagation();
																	runActionWithoutRowClick(() => onOpen(row));
																}}
															>
																<Icon className="h-4 w-4" name="Open" />
																{t("admin.common.open")}
															</DropdownMenuItem>
														)}
														{renderEditAction
															? renderEditAction(row)
															: onEdit && (
																<DropdownMenuItem
																	className="flex items-center gap-3 px-4 py-2.5"
																	onClick={event => event.stopPropagation()}
																	onPointerDown={event => event.stopPropagation()}
																	onSelect={event => {
																		event.stopPropagation();
																		runActionWithoutRowClick(() => onEdit(row));
																	}}
																>
																	<Icon className="h-4 w-4" name="EditPopup" />
																	{t("admin.common.edit")}
																</DropdownMenuItem>
															)}
														{renderDeleteAction
															? renderDeleteAction(row)
															: onDelete && (
																	<DropdownMenuItem
																		className="flex items-center gap-3 px-4 py-2.5"
																		onClick={event => event.stopPropagation()}
																		onPointerDown={event => event.stopPropagation()}
																		onSelect={event => {
																			event.stopPropagation();
																			runActionWithoutRowClick(() => onDelete(row));
																		}}
																	>
																		<Icon className="h-4 w-4" name="DeletePopup" />
																		{deleteLabel ?? t("admin.common.delete")}
																	</DropdownMenuItem>
																)}
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										)}
									</tr>
									);
								})}
							</>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
