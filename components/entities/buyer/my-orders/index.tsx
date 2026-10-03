"use client";

import { useSearchParams } from "next/navigation";
import { useBuyerInstallments, useBuyerOrders } from "@/api/endpoints/entities/buyer";
import { Pagination } from "@/components/global/pagination";
import { Separator } from "@/components/ui/separator";
import { InstallmentsTable } from "./installments-table";
import { MyOrdersActionsBar } from "./my-orders-actions-bar";
import { MyOrdersSummary } from "./my-orders-summary";
import { OrderCard } from "./order-card";

export default function BuyerMyOrders() {
	const params = useSearchParams();
	const tab = params.get("tab") || "INSTALLMENTS";

	useBuyerOrders();
	useBuyerInstallments();

	return (
		<div className="flex h-screen w-full flex-col gap-4 p-4 pb-6">
			<MyOrdersSummary />

			<MyOrdersActionsBar />

			<Separator className="h-[1px] w-full bg-gray-200" />

			<div className="flex-grow">{tab === "INSTALLMENTS" ? <InstallmentsTable /> : <OrderCard />}</div>

			<Pagination />
		</div>
	);
}
