interface InstallmentProgressBarProps {
	installmentsPaid: number;
	installmentsUnpaid: number;
	latePaid: number;
}

export const InstallmentProgressBar = (props: InstallmentProgressBarProps) => {
	const { installmentsPaid, installmentsUnpaid, latePaid } = props;

	const installments = [
		...Array(installmentsPaid + latePaid).fill({ status: "PAID" as const }),
		...Array(installmentsUnpaid).fill({ status: "UNPAID" as const }),
	];

	return (
		<div className="flex w-full gap-[2px] overflow-hidden rounded-lg">
			{installments.map((installment, i) => {
				const backgroundColor = {
					PAID: "#C7E7A3",
					PAYMENT_OVERDUE: "#E55757",
					UNPAID: "#AEAEAE",
				}[installment.status as "PAID" | "PAYMENT_OVERDUE" | "UNPAID"];

				return <div key={i} className="h-6 flex-1 rounded-sm" style={{ backgroundColor }} />; // Increased height to h-6
			})}
		</div>
	);
};
