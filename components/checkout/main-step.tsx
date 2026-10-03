import Link from "next/link";
import { config } from "@/constants/config";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface MainStepProps {
	setStep: (step: "SIGN_IN") => void;
}

export const MainStep = (props: MainStepProps) => {
	const { setStep } = props;

	const howItWorks = [
		"Choose bwadl at checkout",
		"Sign in or Sign up",
		"Receive your goods",
		"Pay your bill in 4 payments",
	];

	return (
		<div className="flex h-screen flex-col items-center gap-8 p-8">
			<img alt="bwadl logo" className="h-24 py-2" src="/static/assets/logo/logo.svg" />

			<Separator className="h-[2px]" />

			<div className="flex w-full flex-1 flex-col justify-around gap-16 px-4">
				<div className="flex flex-col gap-2">
					<span className="text-xl font-bold">How it works</span>

					<div className="mt-4 flex flex-col gap-4">
						{howItWorks.map((item, index) => (
							<div key={index} className="flex items-center gap-4">
								<span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#595959]">
									{index + 1}
								</span>
								<span>{item}</span>
							</div>
						))}
					</div>
				</div>

				<div className="flex items-center gap-4">
					<Button className="flex-1" onClick={() => setStep("SIGN_IN")}>
						Sign In
					</Button>

					<span>or</span>

					<Link className="flex-1" href={config.PATHS.auth.signUp} target="_blank">
						<Button className="w-full" variant="outline">
							Sign Up
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};
