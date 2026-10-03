import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CRNumberStepProps {
	onComplete: () => void;
}

export const CRNumberStep = (props: CRNumberStepProps) => {
	const { onComplete } = props;

	return (
		<div className="flex flex-1 flex-col justify-between gap-2">
			<div className="flex gap-4">
				<Input label="CR Number" name="crNumber" type="text" />

				<Button onClick={onComplete}>Verify</Button>
			</div>
		</div>
	);
};
