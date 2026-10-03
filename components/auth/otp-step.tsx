import { useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

interface OTPStepProps {
	onComplete: () => void;
	value: string;
	onChange: (otp: string) => void;
	loading?: boolean;
}

export const OTPStep = (props: OTPStepProps) => {
	const { onComplete, value, onChange, loading = false } = props;

	useEffect(() => {
		if (value.length === 4) {
			onComplete();
		}
	}, [value]);

	return (
		<div className="flex flex-1 flex-col items-center gap-2">
			<InputOTP disabled={loading} maxLength={4} value={value} onChange={onChange}>
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
	);
};
