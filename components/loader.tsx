import { LoaderIcon } from "lucide-react";

export const Loader = () => {
	return (
		<div>
			<div className="flex h-screen items-center justify-center">
				<div className="animate-spin">
					<LoaderIcon size={32} />
				</div>
			</div>
		</div>
	);
};
