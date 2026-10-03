import { useEffect, useState } from "react";
import { config } from "@/constants/config";
import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../ui/input-otp";
import { Separator } from "../ui/separator";

interface OTPStepProps {
	setStep: (step: "PAYMENT" | "DELTA") => void;
}

export const OTPStep = (props: OTPStepProps) => {
	const { setStep } = props;

	const [resendOTPTimer, setResendOTPTimer] = useState<number | null>(null);
	const [value, setValue] = useState("");

	useEffect(() => {
		const interval = setInterval(() => {
			setResendOTPTimer(prev => (prev ? prev - 1 : null));
		}, 1000);

		return () => clearInterval(interval);
	}, [resendOTPTimer]);

	useEffect(() => {
		if (value.length === 4) {
			setStep(Math.random() < 0.5 ? "PAYMENT" : "DELTA");
		}
	}, [value]);

	return (
		<div className="flex h-screen flex-col items-center gap-8 p-8">
			<img alt="bwadl logo" className="h-12 py-2" src="/static/assets/logo/logo-text.svg" />

			<Separator className="h-[2px]" />

			<div className="flex w-full flex-1 flex-col items-center gap-16 px-4">
				<span className="text-4xl font-bold">Enter OTP</span>

				<p className="text-center text-[#595959]">
					Please enter one time password (OTP) that has been sent to your{" "}
					<strong>email address and mobile number</strong>
				</p>

				<InputOTP maxLength={4} value={value} onChange={setValue}>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
					</InputOTPGroup>

					<InputOTPSeparator />

					<InputOTPGroup>
						<InputOTPSlot index={1} />
					</InputOTPGroup>

					<InputOTPSeparator />

					<InputOTPGroup>
						<InputOTPSlot index={2} />
					</InputOTPGroup>

					<InputOTPSeparator />

					<InputOTPGroup>
						<InputOTPSlot index={3} />
					</InputOTPGroup>
				</InputOTP>

				<span>
					Didn't receive a code?{" "}
					<button
						className={cn("text-[#595959]", resendOTPTimer === null && "hover:underline")}
						disabled={resendOTPTimer !== null}
						type="button"
						onClick={() => {
							setResendOTPTimer(config.RESEND_OTP_INTERVAL);
						}}
					>
						Resend
						{resendOTPTimer !== null ? ` in ${resendOTPTimer}s` : ""}
					</button>
				</span>
			</div>
		</div>
	);
};
