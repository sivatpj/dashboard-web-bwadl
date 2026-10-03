import { LoaderIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
import { Icon } from "@/components/global/icon";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface MerchantProps {
	name: string;
	activeOrders: number;
	totalOrders: number;
	logoUrl: string;
}

const MerchantCard = (props: MerchantProps) => {
	const { name, activeOrders, totalOrders, logoUrl } = props;
	const { t } = useTranslationContext();

	return (
		<div className="flex justify-between gap-2 py-4">
			<div className="relative aspect-square h-full">
				<Image alt={name} className="rounded-full object-cover shadow-xl" src={logoUrl} fill />
			</div>

			<div className="flex flex-1 flex-col gap-2">
				<span className="text-xs">{name}</span>

				<div className="flex items-center gap-2">
					<span className="text-3xl font-bold">{formatCurrency(activeOrders)}</span>
					<span className="text-xs">{t("admin.home.active-orders")}</span>
				</div>

				<div className="flex items-center gap-1 text-xs italic">
					<span className="font-bold">{formatCurrency(totalOrders)}</span>
					<span>{t("admin.home.total-orders-placed")}</span>
				</div>
			</div>
		</div>
	);
};

const MerchantCardWithCounts = ({ supplier, logoUrl }: { supplier: any; logoUrl: string }) => {
	const activeOrders = 0;
	const totalOrders = 0;

	return (
		<MerchantCard
			name={supplier.supplierName || supplier.facilityName || "-"}
			logoUrl={logoUrl}
			activeOrders={activeOrders}
			totalOrders={totalOrders}
		/>
	);
};

export const HomeMerchants = () => {
	const { t, direction } = useTranslationContext();
	const { data, isLoading } = useFetchSuppliers(
		{ limit: 3, page: 1 },
		{
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000,
		},
	);

	const logoMap: Record<string, string> = {
		"Arzaq Plus": "/static/assets/temp/arzaq-logo.png",
	};

	const suppliers = data?.suppliers || [];

	return (
		<div className="flex flex-col gap-4 rounded-md bg-[#EFF5F9] p-6">
			<div className="flex w-full justify-end">
				<Link className="flex items-center gap-2" href={config.PATHS.dashboard.ADMIN.suppliers}>
					<span className="italic">{t("admin.home.view-all")}</span>
					<Icon className={cn(direction === "rtl" && "rotate-180")} name="CircleArrowRight" />
				</Link>
			</div>

			<div className="relative flex flex-1 flex-col gap-4">
				{isLoading && (
					<div className="absolute right-2 top-2 text-[#404040] opacity-70">
						<LoaderIcon className="animate-spin" size={16} />
					</div>
				)}
				{(isLoading ? [1, 2, 3] : []).map(i => (
					<div key={i} className="flex animate-pulse justify-between gap-2 py-4">
						<div className="relative aspect-square h-full">
							<div className="h-14 w-14 rounded-full bg-gray-300" />
						</div>
						<div className="flex flex-1 flex-col gap-2">
							<div className="h-3 w-24 rounded bg-gray-300" />
							<div className="flex items-center gap-2">
								<div className="h-8 w-16 rounded bg-gray-300" />
								<div className="h-3 w-20 rounded bg-gray-300" />
							</div>
							<div className="h-3 w-32 rounded bg-gray-300" />
						</div>
					</div>
				))}
				{!isLoading &&
					suppliers
						.slice(0, 3)
						.map((s, index) => (
							<MerchantCardWithCounts
								key={index}
								supplier={s}
								logoUrl={logoMap[s.supplierName || s.facilityName || "-"] || "/static/assets/temp/arzaq-logo.png"}
							/>
						))}
				{!isLoading && suppliers.length === 0 && (
					<div className="py-6 text-center text-sm text-gray-500">No suppliers to display</div>
				)}
			</div>
		</div>
	);
};
