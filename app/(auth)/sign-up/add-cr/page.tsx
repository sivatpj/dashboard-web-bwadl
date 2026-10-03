"use client";

import Link from "next/link";
import { useState } from "react";
import { CRNumberStep } from "@/components/auth/cr-number-step";
import { DocumentsStep } from "@/components/auth/documents-step";
import { ThankYouStep } from "@/components/auth/thank-you-step";
import { cn } from "@/lib/utils";

type SignUpStep = "CR_NUMBER" | "DOCUMENTS" | "THANK_YOU";

export default function Page(props: PageProps<"/sign-up/add-cr">) {
	const [step, setStep] = useState<SignUpStep>("CR_NUMBER");

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

		THANK_YOU: {
			cta: "Your request will be reviewed, and we will notify you once your request is approved",
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
					{step === "CR_NUMBER" && (
						<>
							<CRNumberStep onComplete={() => setStep("DOCUMENTS")} />

							<span className="text-sm text-[#595959]">
								By Clicking "Verify" you agree on the{" "}
								<Link className="font-bold underline" href="/terms-and-conditions">
									terms and Conditions.
								</Link>
							</span>
						</>
					)}

					{step === "DOCUMENTS" && (
						<DocumentsStep
							// company or individual
							type="ADD_CR"
							// type="INDIVIDUAL"
							onComplete={() => setStep("THANK_YOU")}
						/>
					)}

					{step === "THANK_YOU" && <ThankYouStep onRegisterAnotherCR={() => setStep("CR_NUMBER")} />}
				</div>
			</div>

			<div className="flex-1">
				<img alt={title} src={imageSrc} />
			</div>
		</div>
	);
}
