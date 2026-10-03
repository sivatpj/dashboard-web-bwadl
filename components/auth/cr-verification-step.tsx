import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CRVerificationStepProps {
	onComplete: () => void;
}

export const CRVerificationStep = (props: CRVerificationStepProps) => {
	const { onComplete } = props;

	return (
		<div className="flex flex-1 flex-col justify-between gap-2">
			<Input label="CR Number" name="crNumber" type="text" />

			<div>
				<Button className="px-16" onClick={onComplete}>
					Proceed
				</Button>
			</div>
		</div>
	);
};
