import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface IDNumberStepProps {
	onComplete: () => void;
}

export const IDNumberStep = (props: IDNumberStepProps) => {
	const { onComplete } = props;

	return (
		<div className="flex flex-1 flex-col justify-between gap-2">
			<div className="flex gap-4">
				<Input label="ID Number" name="idNumber" type="text" />

				<Button onClick={onComplete}>Verify</Button>
			</div>
		</div>
	);
};
