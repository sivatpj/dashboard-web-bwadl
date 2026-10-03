"use client";

import Link from "next/link";
import { useState } from "react";
import { CRNumberStep } from "@/components/auth/cr-number-step";
import { DocumentsStep } from "@/components/auth/documents-step";
import { EmailStep } from "@/components/auth/email-step";
import { IDNumberStep } from "@/components/auth/id-number-step";
import { MobileStep } from "@/components/auth/mobile-step";
import { OwnerStep } from "@/components/auth/owner-step";
import { PasswordStep } from "@/components/auth/password-step";
import { ThankYouStep } from "@/components/auth/thank-you-step";
import { cn } from "@/lib/utils";

type SignUpStep =
	| "CR_NUMBER"
	| "EMAIL"
	| "ID_NUMBER"
	| "MOBILE"
	| "DOCUMENTS"
	| "PASSWORD"
	| "OWNER_EMAIL"
	| "THANK_YOU";

export default function Page(props: PageProps<"/sign-up">) {
	const [step, setStep] = useState<SignUpStep>("CR_NUMBER");
	const [isOwned, setIsOwned] = useState(false);

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
		CR_NUMBER: {
			cta: "Please enter your CR number",
			imageSrc: "/static/assets/auth/sign-up/cr-number.svg",
			title: "CR Number",
		},

		DOCUMENTS: {
			cta: "Please attach a copy of the following documents",
			imageSrc: "/static/assets/auth/sign-up/documents.svg",
			title: "Documents",
		},

		EMAIL: {
			cta: "Please enter your corporate Email address",
			imageSrc: "/static/assets/auth/sign-up/verification.svg",
			title: "Email Verification",
		},

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

		OWNER_EMAIL: {
			cta: "Please enter the owner information below",
			imageSrc: "/static/assets/auth/sign-up/verification.svg",
			title: "Owner Email",
		},

		PASSWORD: {
			cta: "Please enter your password",
			imageSrc: "/static/assets/auth/sign-up/password.svg",
			title: "Create Password",
		},

		THANK_YOU: {
			cta: isOwned
				? "Your request will be reviewed, and we will notify you once your request is approved"
				: "A notification has been sent to the CR owner. Your account will be activated once CR owner verifies it",
			imageSrc: "/static/assets/auth/sign-up/thank-you.svg",
			title: "Thank You!",
		},
	}[step];

	return (
		<div className="flex h-screen items-center justify-between gap-24 px-16 py-4">
			<img alt="bwadl logo" className="absolute left-4 top-4 h-16" src="/static/assets/logo/logo.svg" />

			<div className={cn("flex h-[70%] flex-1 flex-col justify-between gap-8")}>
				<div className="flex flex-col gap-2">
					{step === "OWNER_EMAIL" && (
						<span className="pb-4 text-sm font-bold">
							CR Registered is <span className="underline">not under your ID</span>
						</span>
					)}
					<div className="flex flex-col">
						<span className="text-3xl font-bold">{title}</span>

						{!!subtitle && <span className="text-3xl font-bold">{subtitle}</span>}
					</div>

					{!!cta && <span className="text-[#595959]">{cta}</span>}
				</div>

				<div className="flex max-w-[32rem] flex-1 flex-col justify-between gap-8">
					{step === "CR_NUMBER" && (
						<>
							<CRNumberStep onComplete={() => setStep("EMAIL")} />

							<span className="text-sm text-[#595959]">
								By Clicking "Verify" you agree on the{" "}
								<Link className="font-bold underline" href="/terms-and-conditions">
									terms and Conditions.
								</Link>
							</span>
						</>
					)}

					{step === "EMAIL" && (
						<EmailStep
							email={tempEmail}
							otp={tempEmailOTP}
							setEmail={setTempEmail}
							setOTP={setTempEmailOTP}
							onComplete={() => setStep("ID_NUMBER")}
						/>
					)}

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
							onComplete={() => setStep(isOwned ? "DOCUMENTS" : "OWNER_EMAIL")}
						/>
					)}

					{step === "OWNER_EMAIL" && <OwnerStep onComplete={() => setStep("THANK_YOU")} />}

					{step === "DOCUMENTS" && (
						<DocumentsStep
							// company or individual
							type="COMPANY"
							// type="INDIVIDUAL"
							onComplete={() => setStep("THANK_YOU")}
						/>
					)}

					{step === "THANK_YOU" && <ThankYouStep />}
				</div>
			</div>

			<div className="flex-1">
				<img alt={title} src={imageSrc} />
			</div>
		</div>
	);
}
