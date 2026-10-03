import { useBuyerDashboard } from "@/api/endpoints/entities/buyer";
import { ActionButtons } from "./action-buttons";
import { MyInstallments } from "./my-installments";
import { MyLimit } from "./my-limit";
import { MyOrders } from "./my-orders";
import { TotalLimit } from "./total-limit";

export const BuyerDashboard = () => {
	const { data, isPending } = useBuyerDashboard();

	return (
		<div className="flex flex-1 gap-4 p-4">
			<div className="flex h-full flex-[0.65] flex-col gap-6">
				<TotalLimit loading={isPending} totalLimit={data?.results.buyer.creditLimit} />
				{/*
				<MyLimit
					availableLimit={data?.results.buyer.available_limit}
					className="flex-1"
					creditLimit={data?.results.buyer.creditLimit}
					loading={isPending}
					orders={data?.results.orders}
				/> */}

				<MyInstallments installments={data?.results.installments} loading={isPending} />
			</div>

			<div className="flex flex-[0.35] flex-col gap-4">
				<ActionButtons disabled={isPending} />

				<MyOrders loading={isPending} orders={data?.results.orders} />
			</div>
		</div>
	);
};
