import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		defaultVariants: {
			size: "default",
			variant: "default",
		},
		variants: {
			size: {
				default: "h-12 px-6 py-2",
				icon: "h-9 w-9",
				lg: "h-16 rounded-[5px] px-8",
				sm: "h-8 rounded-[5px] px-3 text-xs",
			},
			variant: {
				default: "bg-[#404040] text-primary-foreground hover:bg-primary/90",
				destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
				outline: "border-[0.5px] border-[#3E3E3F] bg-white shadow-sm hover:bg-accent hover:text-accent-foreground",
				secondary: "border-[0.5px] border-[#D9D9D9] bg-white text-white-foreground  hover:bg-white/80",
			},
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, className, variant, size, asChild = false, loading = false, disabled, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				ref={ref}
				className={cn(buttonVariants({ className, size, variant }))}
				disabled={loading || disabled}
				{...props}
			>
				{loading ? (
					<div>
						<Loader className="animate-spin" />
					</div>
				) : (
					children
				)}
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
