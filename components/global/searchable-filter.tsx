"use client";

import { useState } from "react";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";

export type SearchableFilterOption = { id: number; name: string };

export function SearchableFilter({
	label,
	placeholder,
	options,
	selectedId,
	selectedName,
	onApply,
	onClear,
	className,
}: {
	label: string;
	placeholder: string;
	options: SearchableFilterOption[];
	selectedId?: number;
	selectedName?: string;
	onApply: (id: number, name: string) => void;
	onClear: () => void;
	className?: string;
}) {
	const { t } = useTranslationContext();
	const [input, setInput] = useState(selectedName ?? "");
	const [pendingId, setPendingId] = useState<number | null>(null);
	const [isListOpen, setIsListOpen] = useState(false);

	const filteredOptions = options.filter(option => option.name.toLowerCase().includes(input.toLowerCase()));

	return (
		<div className={className ?? "flex w-80 shrink-0 flex-col gap-1"}>
			<label className="text-sm text-[#404040]">{label}</label>
			<div className="relative w-full">
				<div className="flex items-center gap-2">
					<Input
						className="h-12 flex-1"
						placeholder={placeholder}
						value={input}
						onChange={e => {
							setInput(e.target.value);
							setPendingId(null);
						}}
						onFocus={() => setIsListOpen(true)}
						onBlur={() => setTimeout(() => setIsListOpen(false), 150)}
					/>
					<Button
						className="h-12 w-12 shrink-0 p-0"
						disabled={!pendingId}
						size="sm"
						type="button"
						variant="outline"
						onClick={() => {
							const option = options.find(o => o.id === pendingId);
							if (option) onApply(option.id, option.name);
							setIsListOpen(false);
						}}
					>
						<Icon className="h-4 w-4 text-black" name="Search" />
					</Button>
					{(selectedId || input) && (
						<Button
							className="h-12 w-12 shrink-0 p-0"
							size="sm"
							type="button"
							variant="ghost"
							onClick={() => {
								setInput("");
								setPendingId(null);
								onClear();
							}}
						>
							<Icon className="h-4 w-4" name="X" />
						</Button>
					)}
				</div>

				{isListOpen && !pendingId && (
					<div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
						{filteredOptions.length === 0 && <div className="p-3 text-sm text-gray-400">{t("global.no-data-found")}</div>}
						{filteredOptions.map(option => (
							<button
								key={option.id}
								className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
								type="button"
								onMouseDown={e => e.preventDefault()}
								onClick={() => {
									setInput(option.name);
									setPendingId(option.id);
									setIsListOpen(false);
								}}
							>
								{option.name}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
