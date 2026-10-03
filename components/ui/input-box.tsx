import * as React from "react";

import { cn } from "@/lib/utils";
import { InputError } from "./input-error";

export type InputBoxProps = React.ComponentProps<"div"> & {
	error?: string;
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
	label?: string;
	inputClassName?: string;
};

const InputBox = React.forwardRef<HTMLInputElement, InputBoxProps>(
	({ children, label, error, icon, className, iconPosition = "right", inputClassName, ...props }, ref) => {
		return (
			<div className={cn("flex w-full flex-col gap-1", className)}>
				{label && <label className="text-sm text-[#404040]">{label}</label>}

				<div
					className={cn(
						"flex h-12 items-center gap-2 rounded-[5px] border-[0.5px] border-[#D9D9D9] bg-white px-3 transition-colors focus-within:ring-1 focus-within:ring-ring",
						{ "border-red-300": !!error },
					)}
				>
					{icon && iconPosition === "left" && <span className="text-muted-foreground">{icon}</span>}

					<div
						ref={ref}
						className={cn(
							"w-full flex-1 bg-transparent text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
							inputClassName,
						)}
						{...props}
					>
						{children}
					</div>

					{icon && iconPosition === "right" && <span className="text-muted-foreground">{icon}</span>}
				</div>

				<InputError>{error}</InputError>
			</div>
		);
	},
);

InputBox.displayName = "InputBox";

export { InputBox };
