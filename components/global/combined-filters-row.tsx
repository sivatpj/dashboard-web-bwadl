"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/global/icon";
import { SearchableFilterOption } from "@/components/global/searchable-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

export interface CombinedFilterField {
	key: string;
	label: string;
	placeholder: string;
	options: SearchableFilterOption[];
	selectedId?: number;
}

export interface CombinedNumberField {
	key: string;
	label: string;
	placeholder?: string;
	selectedValue?: string;
	min?: number;
}

function FilterComboField({
	label,
	placeholder,
	options,
	valueId,
	valueName,
	onSelect,
	onClear,
	className,
}: {
	label: string;
	placeholder: string;
	options: SearchableFilterOption[];
	valueId?: number;
	valueName?: string;
	onSelect: (id: number, name: string) => void;
	onClear: () => void;
	className?: string;
}) {
	const { t } = useTranslationContext();
	const [input, setInput] = useState(valueName ?? "");
	const [isListOpen, setIsListOpen] = useState(false);

	useEffect(() => {
		setInput(valueName ?? "");
	}, [valueName]);

	const filteredOptions = options.filter(option => option.name.toLowerCase().includes(input.toLowerCase()));

	return (
		<div className={className ?? "flex w-44 shrink-0 flex-col gap-1"}>
			<label className="text-sm text-[#404040]">{label}</label>
			<div className="relative w-full">
				<div className="flex items-center gap-2">
					<Input
						className="h-12 flex-1"
						placeholder={placeholder}
						value={input}
						onChange={e => {
							setInput(e.target.value);
							if (valueId) onClear();
						}}
						onFocus={() => setIsListOpen(true)}
						onBlur={() => setTimeout(() => setIsListOpen(false), 150)}
					/>
					{(valueId || input) && (
						<Button
							className="h-12 w-12 shrink-0 p-0"
							size="sm"
							type="button"
							variant="ghost"
							onClick={() => {
								setInput("");
								setIsListOpen(false);
								onClear();
							}}
						>
							<Icon className="h-4 w-4" name="X" />
						</Button>
					)}
				</div>

				{isListOpen && (
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
									setIsListOpen(false);
									onSelect(option.id, option.name);
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

export function CombinedFiltersRow({
	fields,
	fieldClassName,
	numberField,
}: {
	fields: CombinedFilterField[];
	fieldClassName?: string;
	/** An optional plain number input rendered after the combo fields, applied together with them on search. */
	numberField?: CombinedNumberField;
}) {
	const setParams = useSetParams();

	const [pending, setPending] = useState<Record<string, number | undefined>>(() =>
		Object.fromEntries(fields.map(f => [f.key, f.selectedId])),
	);
	const [numberPending, setNumberPending] = useState(numberField?.selectedValue ?? "");

	const appliedKey = fields.map(f => f.selectedId ?? "").join(",");
	useEffect(() => {
		setPending(Object.fromEntries(fields.map(f => [f.key, f.selectedId])));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appliedKey]);

	useEffect(() => {
		setNumberPending(numberField?.selectedValue ?? "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [numberField?.selectedValue]);

	const applyAll = () =>
		setParams({
			page: null,
			...Object.fromEntries(fields.map(f => [f.key, pending[f.key] ? String(pending[f.key]) : null])),
			...(numberField ? { [numberField.key]: numberPending || null } : {}),
		});

	return (
		<div className="flex flex-wrap items-end gap-2">
			{fields.map(field => (
				<FilterComboField
					key={field.key}
					className={fieldClassName}
					label={field.label}
					options={field.options}
					placeholder={field.placeholder}
					valueId={pending[field.key]}
					valueName={field.options.find(o => o.id === pending[field.key])?.name}
					onClear={() => setPending(p => ({ ...p, [field.key]: undefined }))}
					onSelect={id => setPending(p => ({ ...p, [field.key]: id }))}
				/>
			))}

			{numberField && (
				<div className={fieldClassName ?? "flex w-44 shrink-0 flex-col gap-1"}>
					<label className="text-sm text-[#404040]">{numberField.label}</label>
					<Input
						className="h-12"
						min={numberField.min}
						placeholder={numberField.placeholder}
						type="number"
						value={numberPending}
						onChange={e => setNumberPending(e.target.value)}
						onKeyDown={e => {
							if (e.key === "Enter") applyAll();
						}}
					/>
				</div>
			)}

			<Button className="h-12 w-12 shrink-0 p-0" type="button" variant="outline" onClick={applyAll}>
				<Icon className="h-4 w-4 text-black" name="Search" />
			</Button>
		</div>
	);
}
