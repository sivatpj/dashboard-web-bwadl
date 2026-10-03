"use client";

import { useQueries } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFetchInsurers } from "@/api/endpoints/back-office/insurers/fetch-insurers";
import { useAxios } from "@/api/hooks/axios";
import { Icon } from "@/components/global/icon";
import { Separator } from "@/components/ui/separator";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { cn } from "@/lib/utils";

type InsurerCard = {
	name: string;
	logoUrl: string;
	orders: number;
	expiry: string;
	amount: string;
};

export const HomeInsurers = () => {
	const { t, direction } = useTranslationContext();

	// Fetch insurers (for now there may be only one)
	const { data, isLoading } = useFetchInsurers(
		{ limit: 3, page: 1 },
		{
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000,
		},
	);

	const client = useAxios();
	type InvoicesListResponse = { totalCount: number };
	const insurers = data?.insurers || [];
	const insurerIds = insurers.map(i => i.id);

	const invoicesQueries = useQueries({
		queries: insurerIds.map(id => ({
			enabled: Boolean(id) && !isLoading,
			queryFn: async () => {
				const { data } = await client.get<InvoicesListResponse>("/backoffice/invoices", {
					params: { insurerId: id, limit: 1, page: 1 },
				});
				return data.totalCount || 0;
			},
			queryKey: ["back-office", "invoices", "count", { insurerId: id }],
			retry: 1,
			staleTime: 5 * 60 * 1000,
		})),
	});

	const anyOrdersLoading = invoicesQueries.some(q => q.isLoading);

	const cards: InsurerCard[] = insurers.map((ins, idx) => ({
		amount: "—",
		expiry: "—",
		logoUrl:
			idx === 0
				? "/static/assets/temp/tawuniya.png"
				: idx === 1
					? "/static/assets/temp/bupa.png"
					: "/static/assets/temp/malath.png",
		name: ins.insurerName || ins.facilityName,
		orders: 0,
	}));

	return (
		<div className="relative rounded-xl bg-[#EFF5F9] px-6 py-5">
			<div className="flex w-full justify-end">
				<Link className="flex items-center gap-2" href={config.PATHS.dashboard.ADMIN.insurers}>
					<span className="italic">{t("admin.home.view-all")}</span>
					<Icon className={cn(direction === "rtl" && "rotate-180")} name="CircleArrowRight" />
				</Link>
			</div>

			<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
				{(isLoading || anyOrdersLoading) &&
					[0, 1, 2].map(idx => (
						<div key={idx} className="relative flex items-start gap-6">
							{idx !== 0 && <Separator className="absolute -left-6 hidden h-full md:block" orientation="vertical" />}
							<div className="flex-shrink-0">
								<div className="h-10 w-16 rounded bg-gray-300" />
							</div>
							<div className="flex-1 gap-4">
								<div className="h-4 w-24 rounded bg-gray-300" />
								<div className="mt-2 flex items-baseline gap-6">
									<div className="h-8 w-24 rounded bg-gray-300" />
									<div className="h-4 w-16 rounded bg-gray-200" />
								</div>
								<div className="space-y-2 py-4 text-sm">
									<div className="flex gap-4">
										<div className="h-4 w-40 rounded bg-gray-300" />
									</div>
									<div className="flex items-center gap-6">
										<div className="h-4 w-40 rounded bg-gray-300" />
									</div>
								</div>
							</div>
						</div>
					))}
				{!isLoading &&
					!anyOrdersLoading &&
					cards.map((item, idx) => (
						<div key={item.name + idx} className="relative flex items-start gap-6">
							{idx !== 0 && <Separator className="absolute -left-6 hidden h-full md:block" orientation="vertical" />}

							<div className="flex-shrink-0">
								<Image alt={item.name} className="h-10 w-16 object-contain" height={64} src={item.logoUrl} width={64} />
							</div>

							<div className="flex-1 gap-4">
								<p className="text-sm font-semibold text-gray-800">{item.name}</p>

								<div className="flex items-baseline gap-6">
									<span className="text-4xl font-bold tracking-tight text-black">{item.orders.toLocaleString()}</span>

									<span className="text-sm text-gray-500">{t("admin.home.orders")}</span>
								</div>

								<div className="space-y-2 py-4 text-sm">
									<div className="flex gap-4">
										<span className="text-sm text-gray-500">{t("admin.home.contract-expiry-date")}</span>
										<div>
											<span className="text-sm font-semibold text-gray-800">{item.expiry}</span>
										</div>
									</div>

									<div className="flex items-center gap-6 text-gray-600">
										<span className="whitespace-nowrap text-gray-500">{t("admin.home.insurance-amount")}</span>
										<span className="inline-flex items-center gap-2 font-semibold text-gray-800">
											<Icon name="Riyal" />
											<span>{item.amount}</span>
										</span>
									</div>
								</div>
							</div>
						</div>
					))}
			</div>
		</div>
	);
};
