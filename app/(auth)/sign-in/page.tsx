"use client";

import { useState } from "react";
import { useSignIn, useSubmitOTP } from "@/api/endpoints/authentication";
import { CredentialsStep } from "@/components/auth/credentials-step";
import { OTPStep } from "@/components/auth/otp-step";
import { Icon } from "@/components/global/icon";
import { useAuthContext } from "@/contexts/auth";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SignInStep = "CREDENTIALS" | "OTP";

export default function Page(props: PageProps<"/sign-in">) {
	const { login } = useAuthContext();
	const { toast } = useToast();

	const { t, language, changeLanguage, direction } = useTranslationContext();

	const [step, setStep] = useState<SignInStep>("CREDENTIALS");

	const { mutate: signInMutate, isPending: signInIsPending } = useSignIn({
		onError: () => {
			toast({
				description: t("auth.sign-in.invalid-credentials.description"),
				title: t("auth.sign-in.invalid-credentials.title"),
				variant: "destructive",
			});
		},
		onSuccess: () => {
			setStep("OTP");
		},
	});

	const { mutate: submitOtpMutate, isPending: submitOtpIsPending } = useSubmitOTP({
		onError: () => {
			toast({
				description: t("auth.sign-in.invalid-otp.description"),
				title: t("auth.sign-in.invalid-otp.title"),
				variant: "destructive",
			});
		},
		onSuccess: data => {
			login(data.token);
		},
	});

	const { values, setFieldValue, handleSubmit } = useForm<{
		email: string;
		password: string;
		otp: string;
	}>({
		initialValues: {
			email: process.env.NODE_ENV === "development" ? "demo@bwadl.sa" : "",
			otp: "",
			password: process.env.NODE_ENV === "development" ? "@P@ssme1!" : "",
		},
		onSubmit: values => {
			if (step === "CREDENTIALS") {
				signInMutate({
					email: values.email,
					password: values.password,
				});
			} else if (step === "OTP") {
				submitOtpMutate({
					email: values.email,
					otp: values.otp,
				});
			}
		},
	});

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
		CREDENTIALS: {
			cta: t("auth.sign-in.credentials.cta"),
			imageSrc: "/static/assets/auth/sign-in/credentials.svg",
			subtitle: t("auth.sign-in.credentials.subtitle"),
			title: t("auth.sign-in.credentials.title"),
		},

		OTP: {
			cta: t("auth.sign-in.otp.cta"),
			imageSrc: "/static/assets/auth/sign-in/otp.svg",
			title: t("auth.sign-in.otp.title"),
		},
	}[step];

	return (
		<div className="relative flex h-screen items-center justify-between gap-24 px-16 py-4">
			<button
				aria-label="Switch language"
				className={cn(
					"absolute top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow transition hover:shadow-md",
					direction === "ltr" ? "right-4" : "left-4",
				)}
				type="button"
				onClick={() => changeLanguage(language === "en" ? "ar" : "en")}
			>
				<Icon className="h-6 w-6" name={language === "en" ? "FlagSa" : "FlagUk"} />
			</button>

			{step !== "CREDENTIALS" && (
				<img alt="bwadl logo" className="absolute left-20 top-4 h-16" src="/static/assets/logo/logo.svg" />
			)}

			<div className={cn("flex h-[70%] flex-1 flex-col justify-between gap-8", step === "OTP" && "gap-16")}>
				<div className="flex flex-col gap-2">
					<div className="flex flex-col">
						<span className="text-3xl font-bold">{title}</span>

						{!!subtitle && <span className="text-3xl font-bold">{subtitle}</span>}
					</div>

					{!!cta && <span className="text-[#595959]">{cta}</span>}
				</div>

				<div className="flex max-w-[32rem] flex-1 flex-col justify-between gap-8">
					{step === "CREDENTIALS" && (
						<CredentialsStep
							email={values.email}
							loading={signInIsPending}
							password={values.password}
							setEmail={email => setFieldValue("email", email)}
							setPassword={password => setFieldValue("password", password)}
							onComplete={handleSubmit}
						/>
					)}

					{step === "OTP" && (
						<OTPStep
							loading={submitOtpIsPending}
							value={values.otp}
							onChange={otp => setFieldValue("otp", otp)}
							onComplete={handleSubmit}
						/>
					)}
				</div>
			</div>

			<div className="flex-1">
				<img alt={title} src={imageSrc} />
			</div>
		</div>
	);
}
