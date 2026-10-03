import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { config } from "@/constants/config";

interface EmailStepProps {
	onComplete: () => void;
	email: string;
	setEmail: (email: string) => void;
	otp: string;
	setOTP: (otp: string) => void;
}

export const EmailStep = (props: EmailStepProps) => {
	const { onComplete, email, otp, setEmail, setOTP } = props;

	const [resendOTPTimer, setResendOTPTimer] = useState<number | null>(null);
	const [otpSent, setOtpSent] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setResendOTPTimer(prev => (prev ? prev - 1 : null));
		}, 1000);

		return () => clearInterval(interval);
	}, [resendOTPTimer]);

	useEffect(() => {
		if (otp.length === 4) {
			onComplete();
		}
	}, [otp]);

	return (
		<>
			<div className="flex flex-1 flex-col justify-between gap-2">
				<div className="flex gap-4">
					<Input
						disabled={otpSent}
						label="Email Address"
						name="email"
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
					/>

					{otpSent ? (
						<Button
							disabled={resendOTPTimer !== null}
							onClick={() => {
								setResendOTPTimer(config.RESEND_OTP_INTERVAL);
							}}
						>
							Resend
							{resendOTPTimer !== null ? ` in ${resendOTPTimer}s` : ""}
						</Button>
					) : (
						<Button
							onClick={() => {
								setOtpSent(true);
								setResendOTPTimer(config.RESEND_OTP_INTERVAL);
							}}
						>
							Verify
						</Button>
					)}
				</div>
			</div>

			{otpSent && (
				<>
					<span className="text-[#595959]">
						Please enter the one time password (OTP) that was sent to <strong>{email}</strong>
					</span>

					<div className="flex flex-1 flex-col items-center gap-2">
						<InputOTP maxLength={4} value={otp} onChange={setOTP}>
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
					</div>
				</>
			)}
		</>
	);
};
