import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OwnerStepProps {
	onComplete: () => void;
}

export const OwnerStep = (props: OwnerStepProps) => {
	const { onComplete } = props;

	return (
		<div className="flex flex-1 flex-col justify-between gap-2">
			<div className="flex flex-col gap-16 py-8">
				<Input label="Email Address" name="email" type="email" />

				<Input label="Owner ID" name="owner-id" type="email" />
			</div>

			<div>
				<Button className="px-16" onClick={onComplete}>
					Send Invitation
				</Button>
			</div>
		</div>
	);
};
