"use client";

import Link from "next/link";
import { useState } from "react";
import { EmailStep } from "@/components/auth/email-step";
import { MobileStep } from "@/components/auth/mobile-step";
import { PasswordStep } from "@/components/auth/password-step";
import { Button } from "@/components/ui/button";
import { config } from "@/constants/config";
import { cn } from "@/lib/utils";

type ForgotPasswordStep = "EMAIL" | "MOBILE" | "PASSWORD" | "THANK_YOU";

export default function Page(props: PageProps<"/forgot-password">) {
	const [step, setStep] = useState<ForgotPasswordStep>("EMAIL");

	// TODO: Start Remove this
	const [tempEmail, setTempEmail] = useState("");
	const [tempEmailOTP, setTempEmailOTP] = useState("");

	const [tempMobile, setTempMobile] = useState("");
	const [tempMobileOTP, setTempMobileOTP] = useState("");

	const [tempPassword, setTempPassword] = useState("");
	const [tempConfirmPassword, setTempConfirmPassword] = useState("");
	// TODO: End Remove this

	const {
		cta,
		title,
		subtitle,
		imageSrc,
	}: {
		imageSrc: string;
		cta?: React.ReactNode;
		title: string;
		subtitle?: React.ReactNode;
	} = {
		EMAIL: {
			cta: "Please enter your corporate Email address",
			imageSrc: "/static/assets/auth/forgot-password/verification.svg",
			title: "Email Verification",
		},

		MOBILE: {
			cta: "Please enter your corporate Mobile Number",
			imageSrc: "/static/assets/auth/forgot-password/verification.svg",
			title: "Mobile Verification",
		},

		PASSWORD: {
			cta: "Please enter your new password",
			imageSrc: "/static/assets/auth/forgot-password/password.svg",
			title: "Reset Password",
		},

		THANK_YOU: {
			cta: "Your password has been successfully reset",
			imageSrc: "/static/assets/auth/forgot-password/thank-you.svg",
			title: "Thank You!",
		},
	}[step];

	return (
		<div className="flex h-screen items-center justify-between gap-24 px-16 py-4">
			<img alt="bwadl logo" className="absolute left-4 top-4 h-16" src="/static/assets/logo/logo.svg" />

			<div className={cn("flex h-[70%] flex-1 flex-col justify-between gap-8")}>
				<div className="flex flex-col gap-2">
					<div className="flex flex-col">
						<span className="text-3xl font-bold">{title}</span>

						{!!subtitle && <span className="text-3xl font-bold">{subtitle}</span>}
					</div>

					{!!cta && <span className="text-[#595959]">{cta}</span>}
				</div>

				<div className="flex max-w-[32rem] flex-1 flex-col justify-between gap-8">
					{step === "EMAIL" && (
						<EmailStep
							email={tempEmail}
							otp={tempEmailOTP}
							setEmail={setTempEmail}
							setOTP={setTempEmailOTP}
							onComplete={() => setStep("MOBILE")}
						/>
					)}

					{step === "MOBILE" && (
						<MobileStep
							mobile={tempMobile}
							otp={tempMobileOTP}
							setMobile={setTempMobile}
							setOTP={setTempMobileOTP}
							onComplete={() => setStep("PASSWORD")}
						/>
					)}

					{step === "PASSWORD" && (
						<PasswordStep
							confirmPassword={tempConfirmPassword}
							password={tempPassword}
							onChangeConfirmPassword={setTempConfirmPassword}
							onChangePassword={setTempPassword}
							onComplete={() => setStep("THANK_YOU")}
						/>
					)}

					{step === "THANK_YOU" && (
						<Link href={config.PATHS.auth.signIn}>
							<Button className="w-full">Sign in</Button>
						</Link>
					)}
				</div>
			</div>

			<div className="flex-1">
				<img alt={title} src={imageSrc} />
			</div>
		</div>
	);
}
