import { AmountInput } from "@/components/ui/amount-input";
import { useTranslationContext } from "@/contexts/translation";

interface OfferCardProps {
	entity: string;
	share: {
		value: number;
		error?: string;
		onChange?: (value: number) => void;
	};
	cancellationFees: {
		value: number;
		error?: string;
		onChange?: (value: number) => void;
	};
}

export const OfferCard = (props: OfferCardProps) => {
	const { entity, share, cancellationFees } = props;

	const { t } = useTranslationContext();

	return (
		<div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
			<h3 className="text-lg font-semibold">{entity}</h3>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<AmountInput
					decimals={2}
					error={share.error}
					icon="%"
					iconPosition="right"
					label={t("admin.financiers.offers.share")}
					max={100}
					min={0}
					value={share.value}
					onChange={share.onChange}
				/>

				<AmountInput
					decimals={2}
					error={cancellationFees.error}
					icon="%"
					iconPosition="right"
					label={t("admin.financiers.offers.cancellationFees")}
					max={100}
					min={0}
					value={cancellationFees.value}
					onChange={cancellationFees.onChange}
				/>
			</div>
		</div>
	);
};
