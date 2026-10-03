"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useSetParams = () => {
	const router = useRouter();
	const params = useSearchParams();
	const pathname = usePathname();

	const setParams = (newParams: Record<string, any>) => {
		const oldParams = Object.fromEntries(params);
		const combinedParams = { ...oldParams, ...newParams };
		const searchParams = new URLSearchParams(Object.entries(combinedParams).filter(([_, value]) => value)).toString();
		router.replace(`${pathname}?${searchParams}`, { scroll: false });
	};

	return setParams;
};
