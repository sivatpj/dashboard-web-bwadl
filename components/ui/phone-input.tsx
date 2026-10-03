import * as React from "react";

import { cn } from "@/lib/utils";
import { InputError } from "./input-error";

type PhoneInputProps = React.ComponentProps<"input"> & {
	error?: string;
	icon?: React.ReactNode;
	label?: string;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
	({ label, name, error, icon, className, type, ...props }, ref) => {
		return (
			<div className={cn("flex w-full flex-col gap-1", className)}>
				{label && (
					<label className="text-sm text-[#404040]" htmlFor={name}>
						{label}
					</label>
				)}

				<div className="flex w-full">
					<div className="flex items-center rounded-l-md border border-r-0 border-input bg-black px-4 text-white shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring">
						<span>+966</span>
					</div>

					<div
						className={cn(
							"flex h-12 flex-1 items-center gap-2 rounded-md rounded-l-none border border-l-0 border-input bg-white px-3 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
							{ "border-red-300": !!error },
						)}
					>
						{icon && <span className="text-muted-foreground">{icon}</span>}

						<input
							ref={ref}
							className={cn(
								"w-full flex-1 bg-transparent text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
							)}
							name={name}
							type={type}
							{...props}
						/>
					</div>
				</div>

				<InputError>{error}</InputError>
			</div>
		);
	},
);

PhoneInput.displayName = "Phone Input";

export { PhoneInput };
