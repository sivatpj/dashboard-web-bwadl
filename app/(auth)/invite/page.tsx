"use client";

import { Link } from "lucide-react";
import { useState } from "react";
import { IDNumberStep } from "@/components/auth/id-number-step";
import { MobileStep } from "@/components/auth/mobile-step";
import { PasswordStep } from "@/components/auth/password-step";
import { Button } from "@/components/ui/button";
import { config } from "@/constants/config";
import { cn } from "@/lib/utils";

type SignUpStep = "ID_NUMBER" | "MOBILE" | "PASSWORD" | "THANK_YOU";

export default function Page(props: PageProps<"/invite">) {
	const [step, setStep] = useState<SignUpStep>("ID_NUMBER");

	// TODO: Start Remove this
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
		ID_NUMBER: {
			cta: "Please enter your ID Number",
			imageSrc: "/static/assets/auth/sign-up/id-number.svg",
			title: "ID Number",
		},

		MOBILE: {
			cta: "Please enter your corporate Mobile Number",
			imageSrc: "/static/assets/auth/sign-up/verification.svg",
			title: "Mobile Verification",
		},

		PASSWORD: {
			cta: "Please enter your password",
			imageSrc: "/static/assets/auth/sign-up/password.svg",
			title: "Create Password",
		},

		THANK_YOU: {
			cta: "Your account has been verified. Please sign in to start using bwadl",
			imageSrc: "/static/assets/auth/sign-up/thank-you.svg",
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
					{step === "ID_NUMBER" && <IDNumberStep onComplete={() => setStep("MOBILE")} />}

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
