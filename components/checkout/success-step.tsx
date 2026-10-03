import dayjs from "dayjs";
import Link from "next/link";
import { config } from "@/constants/config";
import { getNumberOrdinal } from "@/lib/get-number-ordinal";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

interface SuccessStepProps {}

export const SuccessStep = (props: SuccessStepProps) => {
	const orderNumber = "123456";
	const approvedAt = dayjs();
	const deliveryDate = dayjs().add(5, "days");
	const installments = Array.from({ length: 4 }).map((_, index) => dayjs().add(index * 5 + 10, "days"));

	return (
		<div className="flex h-screen flex-col items-center gap-8 p-8">
			<img alt="bwadl logo" className="h-12 py-2" src="/static/assets/logo/logo-text.svg" />

			<Separator className="h-[2px]" />

			<div className="flex w-full flex-1 flex-col gap-8 px-4">
				<span className="text-2xl font-bold text-[#404040]">Successful Transaction</span>

				<p>
					Thank you for choosing bwadl, your transaction has been done successfully. Order Number{" "}
					<strong>{orderNumber}</strong>.
				</p>

				<div className="flex flex-col rounded-3xl border-2 p-6 px-8">
					<div className="flex flex-col">
						<div className="flex gap-4">
							<div className="mt-1 flex flex-col items-center justify-center">
								<span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#404040]" />

								<div className="-mb-1">
									<Separator className="h-8 bg-[#404040]" orientation="vertical" />
								</div>
							</div>

							<div className="flex-1">
								<span className="text-[#404040]">Transaction approved</span>
							</div>

							<div>
								<span className="font-bold">
									{approvedAt.format("D")}
									<sup className="text-[10px]">{getNumberOrdinal(approvedAt.date())}</sup>
									{approvedAt.format(" MMMM")}
								</span>
								<span>{approvedAt.format(" YYYY")}</span>
							</div>
						</div>
					</div>

					<div className="flex flex-col">
						<div className="flex gap-4">
							<div className="flex flex-col items-center justify-center">
								<span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#404040]" />

								<div className="-mb-1">
									<Separator className="h-8 bg-[#404040]" orientation="vertical" />
								</div>
							</div>

							<div className="flex-1">
								<span className="text-[#404040]">Shipping items</span>
							</div>

							<div>
								<span className="font-bold">
									{deliveryDate.format("D")}
									<sup className="text-[10px]">{getNumberOrdinal(deliveryDate.date())}</sup>
									{deliveryDate.format(" MMMM")}
								</span>
								<span>{deliveryDate.format(" YYYY")}</span>
							</div>
						</div>
					</div>

					{installments.map((installment, index) => (
						<div key={index} className="flex flex-col">
							<div className="flex gap-4">
								<div className="flex flex-col items-center justify-center">
									<span
										className={cn(
											"flex h-4 w-4 items-center justify-center rounded-full bg-[#404040]",
											index !== installments.length - 1 && "mt-1",
										)}
									/>

									{index !== installments.length - 1 && (
										<div className="-mb-1">
											<Separator className="h-8 bg-[#404040]" orientation="vertical" />
										</div>
									)}
								</div>

								<div className="flex-1">
									<span className="text-[#404040]">
										<strong>
											{index + 1}
											<sup className="text-[10px]">{getNumberOrdinal(index - 1)}</sup>
										</strong>{" "}
										installment
									</span>
								</div>

								<div>
									<span className="font-bold">
										{installment.format("D")}
										<sup className="text-[10px]">{getNumberOrdinal(installment.date())}</sup>
										{installment.format(" MMMM")}
									</span>
									<span>{installment.format(" YYYY")}</span>
								</div>
							</div>
						</div>
					))}
				</div>

				<span className="text-center text-sm">
					Please visit{" "}
					<Link className="font-bold underline" href={config.PATHS.dashboard.BUYER.myOrders} target="_blank">
						Bwadl Dashboard
					</Link>{" "}
					to view and pay your installments or to open dispute
				</span>
			</div>
		</div>
	);
};
