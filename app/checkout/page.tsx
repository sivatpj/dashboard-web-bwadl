"use client";

import { useState } from "react";
import { DeltaStep } from "@/components/checkout/delta-step";
import { MainStep } from "@/components/checkout/main-step";
import { OTPStep } from "@/components/checkout/otp-step";
import { PaymentStep } from "@/components/checkout/payment-step";
import { SignInStep } from "@/components/checkout/sign-in-step";
import { SuccessStep } from "@/components/checkout/success-step";

type Step = "MAIN" | "SIGN_IN" | "OTP" | "DELTA" | "PAYMENT" | "SUCCESS";

export default function Page(props: PageProps<"/">) {
	const [step, setStep] = useState<Step>("MAIN");

	return {
		DELTA: <DeltaStep setStep={setStep} />,
		MAIN: <MainStep setStep={setStep} />,
		OTP: <OTPStep setStep={setStep} />,
		PAYMENT: <PaymentStep setStep={setStep} />,
		SIGN_IN: <SignInStep setStep={setStep} />,
		SUCCESS: <SuccessStep />,
	}[step];
}
