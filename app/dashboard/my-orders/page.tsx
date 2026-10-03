"use client";

import BuyerMyOrders from "@/components/entities/buyer/my-orders";

const ROLE = "BUYER";

export default function Page(props: PageProps<"/dashboard/my-orders">) {
	return {
		"": <div>Hello world</div>,
		ADMIN: <div>Admin My Orders</div>,
		BUYER: <BuyerMyOrders />,
	}[ROLE || ""];
}
