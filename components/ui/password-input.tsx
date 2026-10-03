import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { InputError } from "./input-error";

export type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
	label?: string;
	error?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ label, name, error, className, ...props }, ref) => {
		const [visible, setVisible] = React.useState(false);

		return (
			<div className={cn("flex w-full flex-col gap-1", className)}>
				{label && (
					<label className="text-sm text-[#404040]" htmlFor={name}>
						{label} {props.required && <span className="text-red-500">*</span>}
					</label>
				)}

				<div
					className={cn(
						"relative flex h-12 items-center rounded-[5px] border-[0.5px] border-[#D9D9D9] bg-white transition-colors focus-within:ring-1 focus-within:ring-ring",
						{ "border-red-300": !!error },
					)}
				>
					<input
						ref={ref}
						id={name}
						name={name}
						type={visible ? "text" : "password"}
						className="h-full w-full flex-1 bg-transparent px-3 pr-11 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						{...props}
					/>
					<button
						aria-label={visible ? "Hide password" : "Show password"}
						className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-400 transition-colors hover:text-gray-700"
						tabIndex={-1}
						type="button"
						onClick={() => setVisible(prev => !prev)}
					>
						{visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
					</button>
				</div>

				<InputError>{error}</InputError>
			</div>
		);
	},
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
