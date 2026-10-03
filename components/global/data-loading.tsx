import React from "react";
import { useTranslationContext } from "@/contexts/translation";

interface DataLoadingProps<T> {
	isLoading: boolean;
	data?: T | null;
	children: (data: NonNullable<T>) => React.ReactNode;
}

export function DataLoading<T>(props: DataLoadingProps<T>) {
	const { isLoading, data, children } = props;

	const { t } = useTranslationContext();

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="animate-pulse duration-1000">
					<img alt="logo" className="size-24" src="/static/assets/logo/logo.svg" />
				</div>
			</div>
		);
	}

	if (data == null) {
		return (
			<div className="flex h-full items-center justify-center">
				<span className="text-lg font-semibold">{t("global.no-data-found")}</span>
			</div>
		);
	}

	return <>{children(data)}</>;
}
