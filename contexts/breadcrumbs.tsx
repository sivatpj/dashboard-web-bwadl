"use client";

import { capitalize } from "lodash";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { createContext, ReactNode, useContext, useEffect, useLayoutEffect, useState } from "react";
import { Icon } from "@/components/global/icon";
import { cn } from "@/lib/utils";
import { useTranslationContext } from "./translation";

type BreadcrumbType = {
	position: number;
	title?: string | null;
	href?: string | null;
};

type BreadcrumbsContextType = {
	setBreadcrumbsTitles: (breadcrumbs: BreadcrumbType[]) => void;
	setIsLoading: (isLoading: boolean) => void;
	breadcrumbs: ReactNode[];
};

type BreadcrumbsProviderProps = {
	children: ReactNode;
};
const BreadcrumbsContext = createContext({} as BreadcrumbsContextType);

export function useBreadcrumbsContext() {
	return useContext(BreadcrumbsContext);
}

export const BreadcrumbTitles = (props: { isLoading?: boolean; crumbs: BreadcrumbType[] }) => {
	const { crumbs, isLoading = false } = props;
	const { setBreadcrumbsTitles, setIsLoading } = useBreadcrumbsContext();

	useLayoutEffect(() => {
		setBreadcrumbsTitles(crumbs);

		return () => {
			setBreadcrumbsTitles([]);
		};
	}, [crumbs, setBreadcrumbsTitles]);

	useEffect(() => {
		setIsLoading(isLoading);
	}, [isLoading, setIsLoading]);

	return null;
};

export default function BreadcrumbsProvider({ children }: BreadcrumbsProviderProps) {
	const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbType[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const pathname = usePathname();

	const { t, direction } = useTranslationContext();

	const split = pathname.split("/").filter(Boolean);

	const formatName = (name: string) =>
		name
			.replace(/-/g, " ")
			.split(" ")
			.map(word => capitalize(word))
			.join(" ");

	const crumbs = split
		.map((crumb, i) => {
			const indexOf = split.findIndex(item => item === crumb);

			const previousCrumbs = split.filter((_, i) => i < indexOf + 1);

			const customBreadcrumb = breadcrumbs?.find(breadcrumb => breadcrumb.position === i - 1);

			const name = customBreadcrumb ? customBreadcrumb.title || "..." : formatName(crumb);
			const url = `/${previousCrumbs.join("/")}`;
			if (customBreadcrumb?.title === null) {
				return null;
			}

			if (isLoading) {
				return (
					<React.Fragment key={`breadcrumb-${i}`}>
						<span>...</span>
					</React.Fragment>
				);
			}

			return (
				<React.Fragment key={`breadcrumb-${i}`}>
					{i === split.length - 1 ? <span>{name}</span> : <Link href={customBreadcrumb?.href || url}>{name}</Link>}
				</React.Fragment>
			);
		})
		.filter(Boolean);

	const crumbsWithHome = crumbs.map((crumb, index) => {
		if (index === 0) {
			if (crumbs.length === 1) {
				return (
					<span key={index} className="flex items-center gap-8 font-semibold text-black">
						{t("admin.home.home")}
					</span>
				);
			}

			return null;
		}
		const isLast = index === crumbs.length - 1;

		return (
			<span
				key={index}
				className={cn(
					"flex items-center gap-8",
					isLast ? "font-semibold text-black" : "text-[#404040] hover:text-black hover:underline",
				)}
			>
				{crumb}
				{!isLast && <Icon className={cn("h-5", direction === "ltr" ? "rotate-0" : "rotate-180")} name="ChevronRight" />}
			</span>
		);
	});

	return (
		<BreadcrumbsContext.Provider
			value={{ breadcrumbs: crumbsWithHome, setBreadcrumbsTitles: setBreadcrumbs, setIsLoading }}
		>
			<title>{crumbs.filter(crumb => typeof crumb === "string").join(" / ")}</title>

			{children}
		</BreadcrumbsContext.Provider>
	);
}
