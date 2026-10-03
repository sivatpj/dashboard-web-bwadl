import { Command as CommandPrimitive } from "cmdk";
import { Check } from "lucide-react";
import { type FocusEvent, useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "../global/icon";
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "./command";
import { Input } from "./input";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Skeleton } from "./skeleton";

type AutoCompleteInputPropsBase<T> = {
	searchValue: string;
	onSearchValueChange: (value: string) => void;
	items: {
		value: T extends undefined ? never : Exclude<T, undefined>;
		label: string;
	}[];
	isLoading?: boolean;
	emptyMessage?: string;
	placeholder?: string;
	label?: string;
	name?: string;
	className?: string;
	labelClassName?: string;
	inputClassName?: string;
	error?: string;
	readOnly?: boolean;
	disabled?: boolean;
};

type AutoCompleteInputPropsWithClear<T> = AutoCompleteInputPropsBase<T> & {
	selectedValue: T;
	onSelectedValueChange: (value: T) => void;
	onClear: () => void;
};

type AutoCompleteInputPropsWithoutClear<T> = AutoCompleteInputPropsBase<T> & {
	selectedValue: T;
	onSelectedValueChange: (value: T) => void;
	onClear?: never;
};

type AutoCompleteInputProps<T> = AutoCompleteInputPropsWithClear<T> | AutoCompleteInputPropsWithoutClear<T>;

export function AutoCompleteInput<T extends string | number | undefined>({
	selectedValue,
	onSelectedValueChange,
	searchValue,
	onSearchValueChange,
	items = [],
	isLoading = false,
	emptyMessage = "No items.",
	placeholder = "Search...",
	label,
	name,
	className,
	labelClassName,
	inputClassName,
	error,
	readOnly = false,
	disabled = false,
	onClear,
}: AutoCompleteInputProps<T>) {
	const [open, setOpen] = useState(false);

	// Check if input is interactive
	const isInteractive = !readOnly && !disabled;

	// Create a lookup map for value -> label
	const valueToLabel = useMemo(
		() =>
			items.reduce(
				(map, item) => {
					map[String(item.value)] = item.label;
					return map;
				},
				{} as Record<string, string>,
			),
		[items],
	);

	// Get the current selected label
	const selectedLabel = selectedValue ? (valueToLabel[String(selectedValue)] ?? "") : "";

	// Sync search value with selected label when items load
	useEffect(() => {
		if (selectedLabel) {
			onSearchValueChange(selectedLabel);
		}
	}, [selectedLabel, onSearchValueChange]);

	// Filter items based on search value
	const filteredItems = useMemo(() => {
		if (!searchValue) return items;
		const lowerSearch = searchValue.toLowerCase();
		return items.filter(item => item.label.toLowerCase().includes(lowerSearch));
	}, [items, searchValue]);

	// Handle input blur - reset to selected value if needed
	const handleInputBlur = useCallback(
		(e: FocusEvent<HTMLInputElement>) => {
			const relatedTarget = e.relatedTarget;
			const isCommandList = relatedTarget instanceof Element && relatedTarget.hasAttribute("cmdk-list");

			if (!isCommandList && searchValue !== selectedLabel) {
				onSearchValueChange(selectedLabel);
			}
			setOpen(false);
		},
		[searchValue, selectedLabel, onSearchValueChange, setOpen],
	);

	// Handle item selection
	const handleSelectItem = useCallback(
		(value: T) => {
			onSelectedValueChange(value);
			onSearchValueChange(valueToLabel[String(value)] ?? "");
			setOpen(false);
		},
		[onSelectedValueChange, onSearchValueChange, valueToLabel],
	);

	// Handle clear button
	const handleClear = useCallback(() => {
		(onSelectedValueChange as (value: T) => void)(undefined as T);
		onSearchValueChange("");
		setOpen(false);
		if (onClear) {
			onClear();
		}
	}, [onSelectedValueChange, onSearchValueChange, onClear, setOpen]);

	// Handle input key down
	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setOpen(false);
		}
	}, []);

	// Handle input mouse down - toggle popover
	const handleMouseDown = useCallback(() => {
		if (!isInteractive) return;
		setOpen(prev => !prev || !!searchValue);
	}, [searchValue, isInteractive]);

	const showClearButton = onClear && isInteractive && (!!selectedValue || !!searchValue);

	return (
		<div className={cn("flex w-full flex-col gap-1", className)}>
			{label && (
				<label className={labelClassName || "text-sm text-[#404040]"} htmlFor={name}>
					{label}
				</label>
			)}
			<div className="flex items-center">
				<Popover open={open && isInteractive}>
					<Command shouldFilter={false}>
						<PopoverAnchor asChild>
							<Input
								className={inputClassName}
								placeholder={placeholder}
								value={searchValue || ""}
								onChange={e => onSearchValueChange(e.target.value || "")}
								onFocus={() => isInteractive && setOpen(true)}
								onBlur={handleInputBlur}
								onKeyDown={handleKeyDown}
								onMouseDown={handleMouseDown}
								error={error}
								readOnly={readOnly}
								disabled={disabled}
								icon={
									showClearButton ? (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onMouseDown={e => e.preventDefault()}
											onClick={handleClear}
										>
											<Icon className="h-4 w-4" name="X" />
										</Button>
									) : undefined
								}
							/>
						</PopoverAnchor>
						{!open && <CommandList aria-hidden="true" className="hidden" />}
						<PopoverContent
							className="w-[--radix-popover-trigger-width] p-0"
							asChild
							side="bottom"
							align="start"
							avoidCollisions={false}
							collisionPadding={12}
							onInteractOutside={e => {
								if (e.target instanceof Element && e.target.hasAttribute("cmdk-input")) {
									e.preventDefault();
								}
							}}
							onOpenAutoFocus={e => e.preventDefault()}
						>
							<CommandList
								className="scrollbar-custom overflow-y-auto overscroll-contain pr-1.5"
								style={{ maxHeight: "min(240px, var(--radix-popover-content-available-height, 240px))" }}
								onWheel={e => e.stopPropagation()}
								onMouseDown={e => e.preventDefault()}
							>
								{isLoading && (
									<CommandPrimitive.Loading>
										<div className="p-1">
											<Skeleton className="h-6 w-full" />
										</div>
									</CommandPrimitive.Loading>
								)}
								{!isLoading && filteredItems.length > 0 && (
									<CommandGroup>
										{filteredItems.map(item => (
											<CommandItem
												key={String(item.value)}
												value={String(item.value)}
												onMouseDown={e => e.preventDefault()}
												onSelect={() => handleSelectItem(item.value)}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														selectedValue !== undefined && selectedValue === item.value ? "opacity-100" : "opacity-0",
													)}
												/>
												{item.label}
											</CommandItem>
										))}
									</CommandGroup>
								)}
								{!isLoading && <CommandEmpty>{emptyMessage}</CommandEmpty>}
							</CommandList>
						</PopoverContent>
					</Command>
				</Popover>
			</div>
		</div>
	);
}
