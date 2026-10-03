"use client";

import { generateOrder } from "@/lib/fake-data/generateOrder";
import { OrderCard } from "./order-card";

export const OrdersList = () => {
	const orders = Array.from({ length: 5 }, () => generateOrder());

	return (
		<div className="grid grid-cols-5 gap-4">
			{orders.map(order => (
				<OrderCard key={order.id} {...order} />
			))}
		</div>
	);
};
