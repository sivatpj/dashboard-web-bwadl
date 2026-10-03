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
	disableFutureDates?: boolean;
}

export const DateInput = (props: DateInputProps) => {
	const { value, onChange, error, readOnly, disabled, disableFutureDates, ...rest } = props;
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
				</div>
			</Comp>

			<PopoverContent
				side="bottom"
				align="start"
				avoidCollisions
				collisionPadding={16}
				className="w-[min(320px,92vw)] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto p-0"
			>
				<Calendar
					fixedHeight
					className="w-full"
					mode="single"
					disabled={disableFutureDates ? { after: new Date() } : undefined}
					selected={value ? new Date(value) : undefined}
					onSelect={date => {
						onChange?.(dayjs(date).toISOString());
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
};
