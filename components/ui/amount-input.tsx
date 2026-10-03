import * as React from "react";
import { Icon } from "@/components/global/icon";
import { Input, InputProps } from "./input";

interface AmountInputProps extends Omit<InputProps, "value" | "onChange" | "type" | "defaultValue"> {
	value?: number;
	onChange?: (value: number) => void;
	decimals?: number; // optional decimals, default 2; if 0, no decimal separator allowed
	defaultValue?: number; // initial value, can be used instead of `value`
	// Accept both number and string like native inputs; we'll coerce internally
	min?: number | string; // minimum allowed value (clamped on blur/display)
	max?: number | string; // maximum allowed value (clamped on blur/display)
}

export const AmountInput = (props: AmountInputProps) => {
	const { defaultValue, value, onChange, readOnly, decimals = 2, min, max, icon, iconPosition, ...rest } = props;

	// Coerce min/max to finite numbers if possible
	const toNum = (v?: number | string) => {
		if (v === undefined || v === null) return undefined;
		const n = typeof v === "number" ? v : Number(String(v));
		return Number.isFinite(n) ? n : undefined;
	};
	const minNum = toNum(min);
	const maxNum = toNum(max);

	const allowNegative = typeof minNum === "number" && minNum < 0;

	const clampNumber = (n: number) => {
		let v = n;
		if (typeof minNum === "number") v = Math.max(minNum, v);
		if (typeof maxNum === "number") v = Math.min(maxNum, v);
		return v;
	};

	// Keep only digits and a single decimal dot, limit to `decimals` places on user input
	const sanitize = (s: string) => {
		if (decimals === 0) {
			let out = s.replace(/[^0-9-]/g, "");
			if (!allowNegative) return out.replace(/-/g, "");
			const hasMinus = out.startsWith("-");
			out = out.replace(/-/g, "");
			return (hasMinus ? "-" : "") + out;
		}
		const onlyAllowed = s.replace(/[^0-9.-]/g, "");
		const sign = allowNegative && onlyAllowed.startsWith("-") ? "-" : "";
		const working = onlyAllowed.replace(/-/g, "");
		const firstDot = working.indexOf(".");
		if (firstDot === -1) return sign + working;
		const intPart = working.slice(0, firstDot);
		const fracRaw = working.slice(firstDot + 1).replace(/\./g, "");
		const frac = fracRaw.slice(0, decimals);
		return sign + (frac.length > 0 ? `${intPart}.${frac}` : `${intPart}.`);
	};

	// Add thousands separators to integer part, keep fraction as-typed
	const formatDisplay = (normalized: string) => {
		if (!normalized) return "";
		if (normalized === "-" || normalized === "." || normalized === "-.") return normalized; // allow typing leading signs/dot
		const sign = normalized.startsWith("-") ? "-" : "";
		const abs = sign ? normalized.slice(1) : normalized;
		const hasDot = abs.includes(".");
		const [intPart, fracPart = ""] = abs.split(".");
		const intDigits = intPart.replace(/^0+(?=\d)/, "");
		const groupedInt = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return sign + groupedInt + (hasDot ? "." : "") + (decimals === 0 ? "" : fracPart);
	};

	// Normalize a number to a string with up to `decimals` decimals (rounded) for initial/prop-driven display
	const fromNumber = (n?: number) => {
		if (typeof n !== "number" || !Number.isFinite(n)) return "";
		const clamped = clampNumber(n);
		let s = clamped.toFixed(Math.max(0, decimals));
		if (decimals > 0) {
			// trim trailing zeros after decimal and possible trailing dot
			s = s.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
		}
		return s;
	};

	const [inputValue, setInputValue] = React.useState<string>(() => {
		return formatDisplay(fromNumber(value ?? defaultValue));
	});
	const lastCommittedRef = React.useRef<number | undefined>(value);
	const inputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (value !== lastCommittedRef.current) {
			setInputValue(formatDisplay(fromNumber(value)));
			lastCommittedRef.current = value;
		}
	}, [value, decimals, min, max]);

	const setCaret = (pos: number) => {
		const el = inputRef.current;
		if (!el) return;
		try {
			if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
				window.requestAnimationFrame(() => {
					el.setSelectionRange(pos, pos);
				});
			} else {
				setTimeout(() => el.setSelectionRange(pos, pos), 0);
			}
		} catch {
			// ignore selection errors
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		const caret = e.target.selectionStart ?? raw.length;
		const leftRaw = raw.slice(0, caret);

		const normalized = sanitize(raw);

		// If emptied, notify zero immediately
		if (normalized === "") {
			setInputValue("");
			setCaret(0);
			const zero = clampNumber(0);
			lastCommittedRef.current = zero;
			onChange?.(zero);
			return;
		}

		const leftNormalized = sanitize(leftRaw);

		// Determine if the user is in the middle of typing a partial token
		const typingPartial = normalized === "-" || normalized === "." || normalized === "-." || normalized.endsWith(".");

		let nextDisplay: string;
		let toNotify: number | undefined;

		const parsed = parseFloat(normalized);
		if (!Number.isNaN(parsed)) {
			const clamped = clampNumber(parsed);
			toNotify = clamped;
			if (!typingPartial && clamped !== parsed) {
				// Immediately clamp the visible value if it's out of bounds and not a partial token
				nextDisplay = formatDisplay(fromNumber(clamped));
				setInputValue(nextDisplay);
				setCaret(nextDisplay.length);
				lastCommittedRef.current = clamped;
				onChange?.(clamped);
				return;
			}
		}

		// Default path: keep formatted view of what the user typed
		nextDisplay = formatDisplay(normalized);
		const leftDisplay = formatDisplay(leftNormalized);
		setInputValue(nextDisplay);
		setCaret(leftDisplay.length);

		if (toNotify !== undefined) {
			lastCommittedRef.current = toNotify;
			onChange?.(toNotify);
		}
	};

	const handleBlur = () => {
		let normalized = sanitize(inputValue);
		if (normalized === "" || normalized === "." || normalized === "-") {
			setInputValue("");
			const zero = clampNumber(0);
			lastCommittedRef.current = zero;
			onChange?.(zero);
			return;
		}
		// If user left a trailing dot with no fraction, drop it on blur
		if (decimals > 0 && normalized.endsWith(".")) {
			normalized = normalized.slice(0, -1);
		}
		// If the fraction is all zeros, remove the decimal part entirely
		if (decimals > 0 && normalized.includes(".")) {
			const abs = normalized.startsWith("-") ? normalized.slice(1) : normalized;
			const [intPart, fracPart = ""] = abs.split(".");
			if (/^0*$/.test(fracPart)) {
				normalized = (normalized.startsWith("-") ? "-" : "") + intPart;
			}
		}
		let n = parseFloat(normalized);
		if (!Number.isNaN(n)) {
			const clamped = clampNumber(n);
			n = clamped;
			normalized = fromNumber(clamped);
			lastCommittedRef.current = n;
			onChange?.(n);
		}
		const display = formatDisplay(normalized);
		setInputValue(display);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const allowedControlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
		if (allowedControlKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
		const isDigit = /^[0-9]$/.test(e.key);
		if (isDigit) return;
		if (e.key === "-") {
			if (!allowNegative) {
				e.preventDefault();
				return;
			}
			const v = sanitize(e.currentTarget.value);
			const hasMinus = v.startsWith("-");
			const caret = e.currentTarget.selectionStart ?? 0;
			const end = e.currentTarget.selectionEnd ?? caret;
			const selectingAll = caret === 0 && end === v.length;
			if (hasMinus && !selectingAll) {
				e.preventDefault();
				return;
			}
			if (caret !== 0 && !selectingAll) {
				e.preventDefault();
				return;
			}
			return;
		}
		if (e.key === ".") {
			if (decimals === 0) {
				e.preventDefault();
				return;
			}
			const v = sanitize(e.currentTarget.value);
			if (v.includes(".")) e.preventDefault();
			return;
		}
		// Disallow commas as input (we'll show them as group separators only)
		if (e.key === ",") {
			e.preventDefault();
			return;
		}
		e.preventDefault();
	};

	const resolvedIcon = icon !== undefined ? icon : <Icon className="w-4" name="Riyal" />;
	const resolvedIconPosition = iconPosition ?? "left";

	if (readOnly) {
		return (
			<Input
				{...rest}
				icon={resolvedIcon}
				iconPosition={resolvedIconPosition}
				type="text"
				value={inputValue}
				readOnly
			/>
		);
	}

	return (
		<Input
			ref={inputRef}
			{...rest}
			icon={resolvedIcon}
			iconPosition={resolvedIconPosition}
			inputMode={decimals === 0 ? "numeric" : "decimal"}
			type="text"
			value={inputValue}
			onBlur={handleBlur}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
		/>
	);
};
