"use client";

import { useFetchWhoAmI } from "@/api/endpoints/fetch-who-am-i";
import { AdminLayout } from "@/components/layouts/admin/admin-layout";
import { BuyerLayout } from "@/components/layouts/buyer/buyer-layout";

export default function Layout(props: LayoutProps<"/dashboard">) {
	const { children } = props;

	return <AdminLayout>{children}</AdminLayout>;
}
