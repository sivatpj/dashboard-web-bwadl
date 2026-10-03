import { useEffect, useRef, useState } from "react";
import { config } from "@/constants/config";
import { useAuthContext } from "@/contexts/auth";
import { useTranslationContext } from "@/contexts/translation";
import { cn } from "@/lib/utils";

type InitialLoaderProviderProps = {
	children: React.ReactNode;
};

export const InitialLoaderProvider = ({ children }: InitialLoaderProviderProps) => {
	const translation = useTranslationContext();
	const auth = useAuthContext();

	const [showContent, setShowContent] = useState(false);

	const startTimeRef = useRef(Date.now());

	const shouldRenderContent = !translation.loading && !auth.loading;

	useEffect(() => {
		if (!shouldRenderContent) return;

		const elapsed = Date.now() - startTimeRef.current;
		const minDisplayTime = process.env.NODE_ENV === "development" ? 2000 : config.LOADER_MINIMUM_DISPLAY_TIME_MS;
		const remaining = Math.max(0, minDisplayTime - elapsed);

		const timeout = setTimeout(() => {
			setShowContent(true);
		}, remaining);

		return () => clearTimeout(timeout);
	}, [shouldRenderContent]);

	return (
		<>
			<div
				className={cn(
					"fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-[#E8E9EA] to-[#E0F4FF] transition-opacity duration-500",
					showContent ? "pointer-events-none opacity-0" : "opacity-100",
				)}
			>
				<div className="animate-pulse duration-1000">
					<img alt="logo" className="size-24" src="/static/assets/logo/logo.svg" />
				</div>
			</div>

			{shouldRenderContent && (
				<div className={cn("transition-opacity duration-500", showContent ? "opacity-100" : "opacity-0")}>
					{children}
				</div>
			)}
		</>
	);
};
