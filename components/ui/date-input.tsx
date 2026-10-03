import { format } from "date-fns";
import dayjs from "dayjs";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "../global/icon";
import { Calendar } from "./calendar";
import { Input, InputProps } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DateInputProps extends Omit<InputProps, "value" | "onChange" | "type"> {
	value?: string;
	onChange?: (date: string) => void;
	error?: string;
	allowClear?: boolean;
	onClear?: () => void;
	side?: "top" | "bottom" | "left" | "right";
	disableFutureDates?: boolean;
	allowFutureDates?: boolean;
	/** Emit a plain "YYYY-MM-DD" date instead of a UTC ISO timestamp. Use when only the calendar date matters. */
	dateOnly?: boolean;
}

export const DateInput = (props: DateInputProps) => {
	const {
		value,
		onChange,
		error,
		readOnly,
		disabled,
		allowClear,
		onClear,
		side = "bottom",
		disableFutureDates,
		allowFutureDates,
		dateOnly,
		...rest
	} = props;
	const [open, setOpen] = React.useState(false);

	const disabledOrReadOnly = readOnly || disabled;
	const Comp = disabledOrReadOnly ? React.Fragment : PopoverTrigger;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<Comp asChild>
				<div className="relative">
					<Input
						{...rest}
						className={cn(!disabledOrReadOnly && "cursor-pointer", "w-full")}
						disabled={disabled}
						error={error}
						icon={<Icon name="Calendar" />}
						iconPosition="right"
						value={value ? format(value, "dd/MM/yyyy") : ""}
						readOnly
						required={props.required}
					/>
					{allowClear && !!value && !disabledOrReadOnly && (
						<button
							type="button"
							aria-label="Clear date"
							onClick={e => {
								e.stopPropagation();
								onChange?.("");
								onClear?.();
							}}
							className="absolute right-12 top-1/2 rounded p-1 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
						>
							<Icon className="h-4 w-4" name="X" />
						</button>
					)}
				</div>
			</Comp>

			<PopoverContent
				side={side}
				align="start"
				avoidCollisions
				collisionPadding={16}
				className="w-[min(320px,92vw)] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto p-0"
			>
				<Calendar
					fixedHeight
					allowFutureDates={allowFutureDates}
					className="w-full"
					mode="single"
					selected={value ? new Date(value) : undefined}
					disabled={disableFutureDates ? { after: new Date() } : undefined}
					onSelect={date => {
						onChange?.(dateOnly ? dayjs(date).format("YYYY-MM-DD") : dayjs(date).toISOString());
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
};
