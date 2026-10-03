"use client";

import { useFetchWhoAmI } from "@/api/endpoints/fetch-who-am-i";
import { AdminDashboard } from "@/components/entities/admin/dashboard";
import { BuyerDashboard } from "@/components/entities/buyer/dashboard";
import { useAuthContext } from "@/contexts/auth";

export default function Page(props: PageProps<"/dashboard">) {
	// const { data } = useFetchWhoAmI()

	return <AdminDashboard />;

	// return {
	// 	BUYER: <BuyerDashboard />,
	// 	ADMIN: <AdminDashboard />,
	// }[participantType];
}
