import { formatCurrency } from "@/lib/format-currency";
import { Icon } from "../global/icon";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface DeltaStepProps {
	setStep: (step: "PAYMENT") => void;
}

export const DeltaStep = (props: DeltaStepProps) => {
	const { setStep } = props;

	const usedLimit = 10000;
	const currentBill = 18500;
	const availableLimit = 15500;
	const deltaAmount = currentBill - availableLimit;

	return (
		<div className="flex h-screen flex-col items-center gap-8 p-8">
			<img alt="bwadl logo" className="h-12 py-2" src="/static/assets/logo/logo-text.svg" />

			<Separator className="h-[2px]" />

			<div className="flex w-full flex-1 flex-col gap-8 px-4">
				<span className="text-xl text-[#404040]">Your invoice exceeds your available limit</span>

				<div className="flex flex-col items-center justify-between gap-8">
					<div className="flex w-full items-center">
						<div className="h-8 rounded-l-md bg-black" style={{ flex: usedLimit }} />
						<div className="h-14 w-2.5 rounded-sm border-2 border-white bg-black" />
						<div className="h-8 rounded-tr-md bg-[#8C8C8C] bg-stripes" style={{ flex: currentBill }} />
						<div className="flex h-full flex-col justify-end" style={{ flex: deltaAmount }}>
							<div className="h-4 flex-1 bg-transparent" />
							<div className="mb-1 h-2 flex-1 rounded-r-md bg-[#E55757]" />
							<span className="-mb-2 -ml-4 flex items-center gap-1 text-xs font-bold text-[#E55757]">
								<Icon className="h-3 w-3 fill-red-400" name="Riyal" />
								<span>{formatCurrency(deltaAmount)}</span>
								<span>(-)</span>
							</span>
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
				</div>

				<Separator className="h-[2px]" />

				<div className="flex flex-1 flex-col items-center justify-center gap-8">
					<p className="font-bold">Settle the difference using one of the available payment methods.</p>

					<Button className="w-[80%] rounded-lg" onClick={() => setStep("PAYMENT")}>
						Settle the difference
					</Button>

					<img alt="bwadl logo" className="h-12 py-2" src="/static/assets/checkout/payment-methods.svg" />
				</div>

				<span className="text-center text-sm">
					Once your payment is completed, this page will be refreshed automatically, please do not close the browser.
				</span>
			</div>
		</div>
	);
};
