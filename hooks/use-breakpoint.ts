import { createBreakpoint } from "react-use";
import tailwind from "tailwindcss/defaultTheme";

export const breakpoints = {
	"2xl": Number.parseInt(tailwind.screens["2xl"]),
	lg: Number.parseInt(tailwind.screens.lg),
	md: Number.parseInt(tailwind.screens.md),
	sm: Number.parseInt(tailwind.screens.sm),
	xl: Number.parseInt(tailwind.screens.xl),
	xs: 0,
};

export const useBreakpoint = createBreakpoint(breakpoints) as () => keyof typeof breakpoints;
