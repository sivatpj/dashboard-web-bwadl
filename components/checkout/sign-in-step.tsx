import Link from "next/link";
import { config } from "@/constants/config";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

interface SignInStepProps {
	setStep: (step: "OTP" | "MAIN") => void;
}

export const SignInStep = (props: SignInStepProps) => {
	const { setStep } = props;

	return (
		<div className="flex h-screen flex-col items-center gap-8 p-8">
			<img alt="bwadl logo" className="h-12 py-2" src="/static/assets/logo/logo-text.svg" />

			<Separator className="h-[2px]" />

			<div className="flex w-full flex-1 flex-col justify-around gap-16 px-4">
				<div className="flex flex-col gap-8">
					<span className="text-xl font-bold">Login to bwadl</span>

					<div className="flex flex-col gap-6">
						<div>
							<label htmlFor="username">Email or Mobile</label>

							<Input name="username" type="text" />
						</div>

						<div>
							<label htmlFor="password">Password</label>

							<Input name="password" type="password" />
						</div>
					</div>

					<div className="flex justify-end">
						<Link
							className="text-sm text-[#595959] hover:underline"
							href={config.PATHS.auth.forgotPassword}
							target="_blank"
						>
							Forgot Password?
						</Link>
					</div>
				</div>

				<div className="flex w-full flex-col items-center gap-4">
					<Button className="w-full" onClick={() => setStep("OTP")}>
						Sign In
					</Button>

					<Button className="w-full" variant="ghost" onClick={() => setStep("MAIN")}>
						Back
					</Button>
				</div>
			</div>
		</div>
	);
};
