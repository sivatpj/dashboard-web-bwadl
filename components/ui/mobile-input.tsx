import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";
import { InputError } from "./input-error";

export type MobileInputProps = Omit<React.ComponentProps<"input">, "type" | "inputMode"> & {
	label?: string;
	error?: string;
};

const SAUDI_MOBILE_REGEX = /^05\d{8}$/;

export const isValidSaudiMobile = (value?: string) => !!value && SAUDI_MOBILE_REGEX.test(value);

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
	({ label, name, error, className, ...props }, ref) => {
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const sanitizedValue = e.target.value.replace(/\D/g, "").slice(0, 10);
			e.target.value = sanitizedValue;
			props.onChange?.(e);
		};

		return (
			<div className={cn("flex w-full flex-col gap-1", className)}>
				{label && (
					<label className="text-sm text-[#404040]" htmlFor={name}>
						{label}
					</label>
				)}

				<div
					className={cn(
						"flex h-12 w-full items-center rounded-[5px] border-[0.5px] border-[#D9D9D9] bg-white transition-colors focus-within:ring-1 focus-within:ring-ring",
						{ "border-red-300": !!error },
					)}
				>
					{/* Flag badge */}
					<div className="flex shrink-0 items-center justify-center rounded-[4px] mx-2 h-8 w-10">
						<Image priority unoptimized alt="Saudi flag" src="/static/images/Saudi-Flag.png" height={32} width={32} />

					</div>

					{/* Divider */}
					<div className="h-full w-px bg-[#D9D9D9]" />

					{/* Number input */}
					<input
						ref={ref}
						id={name}
						name={name}
						type="tel"
						inputMode="numeric"
						maxLength={10}
						className="h-full flex-1 bg-transparent px-3 text-sm font-semibold placeholder:font-normal placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						{...props}
						onChange={handleChange}
					/>
				</div>

				<InputError>{error}</InputError>
			</div>
		);
	},
);

MobileInput.displayName = "MobileInput";

export { MobileInput };
