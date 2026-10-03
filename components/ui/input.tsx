import * as React from "react";

import { cn } from "@/lib/utils";
import { InputError } from "./input-error";

export type InputProps = React.ComponentProps<"input"> & {
	error?: string;
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
	label?: string;
	inputClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ label, error, icon, className, type, name, iconPosition = "right", inputClassName, ...props }, ref) => {
		const internalRef = React.useRef<HTMLInputElement>(null);
		const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

		const handleIconClick = () => {
			inputRef.current?.focus();
		};

		return (
			<div className={cn("flex w-full flex-col gap-1", className)}>
				{label && (
					<label className="text-sm text-[#404040]" htmlFor={name}>
						{label} {props.required && <span className="text-red-500">*</span>}
					</label>
				)}

				<div
					className={cn(
						"flex h-12 items-center gap-2 rounded-[5px] border-[0.5px] border-[#D9D9D9] bg-white px-3 transition-colors focus-within:ring-1 focus-within:ring-ring",
						{ "border-red-300": !!error },
					)}
				>
					{icon && iconPosition === "left" && (
						<span className="text-muted-foreground cursor-default" onClick={handleIconClick}>
							{icon}
						</span>
					)}

					<input
						ref={inputRef}
						className={cn(
							"w-full h-full flex-1 bg-transparent text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
							inputClassName,
						)}
						name={name}
						type={type}
						{...props}
					/>

					{icon && iconPosition === "right" && (
						<span className="text-muted-foreground cursor-default" onClick={handleIconClick}>
							{icon}
						</span>
					)}
				</div>

				<InputError>{error}</InputError>
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input };
