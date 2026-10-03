import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
	disabled?: boolean;
}

export const ActionButtons = (props: ActionButtonsProps) => {
	const { disabled } = props;

	return (
		<div className="flex justify-end">
			<Button
				className="flex h-14 items-center justify-end bg-black px-6 shadow-md hover:bg-gray-900"
				disabled={disabled}
				variant="default"
			>
				UPGRADE YOUR LIMIT <Icon name="Rocket" />
			</Button>
		</div>
	);
};
