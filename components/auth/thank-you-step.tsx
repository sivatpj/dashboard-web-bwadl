import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { config } from "@/constants/config";

interface ThankYouStepProps {
	onRegisterAnotherCR?: () => void;
}

export const ThankYouStep = (props: ThankYouStepProps) => {
	const { onRegisterAnotherCR } = props;

	const router = useRouter();

	return (
		<div className="flex flex-1 flex-col justify-between gap-2">
			<div className="flex flex-col gap-6 overflow-y-scroll">
				<Link href={config.PATHS.auth.signIn}>
					<Button className="w-full">Sign in</Button>
				</Link>

				<Button
					variant="outline"
					onClick={
						onRegisterAnotherCR
							? onRegisterAnotherCR
							: () => router.push(`${config.PATHS.auth.addCr}?token=ADD_TOKEN_HERE`)
					}
				>
					Register another CR to your account
				</Button>
			</div>
		</div>
	);
};
