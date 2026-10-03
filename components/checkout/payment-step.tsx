import dayjs from "dayjs";
import Link from "next/link";
import { config } from "@/constants/config";
import { formatCurrency } from "@/lib/format-currency";
import { getNumberOrdinal } from "@/lib/get-number-ordinal";
import { cn } from "@/lib/utils";
import { Icon } from "../global/icon";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface PaymentStepProps {
	setStep: (step: "SUCCESS") => void;
}

export const PaymentStep = (props: PaymentStepProps) => {
	const { setStep } = props;

	const installments = Array.from({ length: 4 }).map((_, index) => dayjs().add(index * 5, "days"));

	const usedLimit = 10000;
	const currentBill = 15500;
	const availableLimit = 15500;

	return (
		<div className="flex h-screen flex-col items-center gap-8 p-8">
			<img alt="bwadl logo" className="h-12 py-2" src="/static/assets/logo/logo-text.svg" />

			<Separator className="h-[2px]" />

			<div className="flex w-full flex-1 flex-col gap-8 px-4">
				<span className="text-2xl font-bold text-[#404040]">Divide your bill into 4 payments</span>

				<div className="flex flex-col rounded-3xl border-2 p-6 px-6">
					{installments.map((installment, index) => (
						<div key={index} className="flex flex-col">
							<div className="flex items-center gap-4">
								<div className="flex flex-col items-center justify-center">
									<span
										className={cn(
											"flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#595959]",
											index !== installments.length - 1 && "mt-1",
										)}
									>
										{index + 1}
									</span>

									{index !== installments.length - 1 && (
										<div className="-mb-1">
											<Separator className="h-4 bg-white" orientation="vertical" />
										</div>
									)}
								</div>

								<Icon className="h-5 w-5" name={`Progress${(index + 1) as 1 | 2 | 3 | 4}4`} />

								{dayjs(installment).isSame(dayjs(), "day") ? (
									<div className="flex-1 px-4">
										<span className="font-bold">Today</span>
									</div>
								) : (
									<div className="flex-1 px-4">
										<span className="font-bold">
											{installment.format("D")}
											<sup className="text-[10px]">{getNumberOrdinal(installment.date())}</sup>
											{installment.format(" MMMM")}
										</span>
										<span>{installment.format(" YYYY")}</span>
									</div>
								)}

								<div className="flex items-center gap-1">
									<Icon name="Riyal" />
									{formatCurrency(currentBill / 4)}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="flex flex-1 flex-col items-center justify-between">
					<div className="flex w-full items-center">
						<div className="h-8 rounded-l-md bg-black" style={{ flex: usedLimit }} />
						<div className="h-14 w-2.5 rounded-sm border-2 border-white bg-black" />

						<div className="flex overflow-hidden rounded-r-md" style={{ flex: availableLimit + currentBill }}>
							<div className="h-8 bg-[#8C8C8C] bg-stripes" style={{ flex: currentBill }} />
							<div className="h-8 bg-[#8C8C8C]" style={{ flex: availableLimit }} />
						</div>
					</div>

					<div className="flex w-full items-center gap-2">
						<div className="flex w-full items-center gap-2">
							<div className="h-12 w-3 rounded-sm bg-black" />

							<div className="flex flex-1 flex-col">
								<span>Used limit</span>
								<span className="flex items-center gap-2 font-bold">
									{formatCurrency(usedLimit)}
									<Icon name="Riyal" />
								</span>
							</div>
						</div>

						<div className="flex w-full items-center gap-2">
							<div className="h-12 w-3 rounded-sm bg-[#8C8C8C] bg-stripes" />

							<div className="flex flex-1 flex-col">
								<span>Current bill</span>
								<span className="flex items-center gap-2 font-bold">
									{formatCurrency(currentBill)}
									<Icon name="Riyal" />
								</span>
							</div>
						</div>

						<div className="flex w-full items-center gap-2">
							<div className="h-12 w-3 rounded-sm bg-[#8C8C8C]" />

							<div className="flex flex-1 flex-col">
								<span>Available limit</span>
								<span className="flex items-center gap-2 font-bold">
									{formatCurrency(availableLimit)}
									<Icon name="Riyal" />
								</span>
							</div>
						</div>
					</div>

					<Button className="w-[80%] rounded-lg" onClick={() => setStep("SUCCESS")}>
						<img alt="bwadl logo" className="h-18 py-2" src="/static/assets/checkout/proceed.svg" />
					</Button>
				</div>

				<span className="text-center text-sm">
					By proceeding, you agree on the{" "}
					<Link className="font-bold underline" href={config.PATHS.termsAndConditions} target="_blank">
						Terms and Conditions
					</Link>
				</span>
			</div>
		</div>
	);
};
