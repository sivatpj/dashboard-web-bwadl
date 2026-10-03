"use client";

import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import {
	useLeadEmailVerify,
	useLeadEmailVerifyOTP,
	useLeadEmailVerifySetPassword,
} from "@/api/endpoints/authentication";
import { OTPStep } from "@/components/auth/otp-step";
import { PasswordStep } from "@/components/auth/password-step";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { validatePassword } from "@/lib/validate-password";

type LeadStep = "OTP" | "PASSWORD";

export default function Page(props: PageProps<"/lead-email-verify/[id]">) {
	const { id } = use(props.params);

	const { toast } = useToast();

	const router = useRouter();

	const [step, setStep] = useState<LeadStep>("OTP");

	const {
		isPending: leadEmailVerifyIsPending,
		isError,
		isSuccess,
	} = useLeadEmailVerify({ token: id }, { enabled: !!id, networkMode: "always", retryOnMount: false });

	const { mutate: leadEmailVerifyOtpMutate, isPending: leadEmailVerifyOtpIsPending } = useLeadEmailVerifyOTP({
		onError: () => {
			toast({
				description: "The OTP you entered is invalid or has expired",
				title: "Invalid OTP",
				variant: "destructive",
			});
		},
		onSuccess: data => {
			setStep("PASSWORD");
			setFieldValue("token", data.token);
		},
	});

	const { mutate: leadEmailVerifySetPasswordMutate, isPending: leadEmailVerifySetPasswordIsPending } =
		useLeadEmailVerifySetPassword({
			onError: () => {
				toast({
					description: "Something went wrong setting your password",
					title: "Error",
					variant: "destructive",
				});
			},
			onSuccess: () => {
				toast({
					description: "Your password has been set successfully",
					title: "Password Set",
				});

				router.push("/sign-in");
			},
		});

	const decodedJWT = jwtDecode(id) as {
		email: string;
		language: string;
		name: string;
		referenceNumber: string;
		verificationToken: string;
	};

	useEffect(() => {
		if (isSuccess) {
			toast({
				description: "Please check your email for the OTP",
				title: "OTP Sent",
			});
		} else if (isError) {
			toast({
				description: "Something went wrong sending the OTP",
				title: "Error",
				variant: "destructive",
			});
		}
	}, [id, isSuccess, isError, leadEmailVerifyIsPending]);

	const { values, setFieldValue, handleSubmit } = useForm<{
		confirmPassword: string;
		password: string;
		otp: string;
		token: string;
	}>({
		initialValues: {
			confirmPassword: "",
			otp: "",
			password: "",
			token: "",
		},
		onSubmit: values => {
			if (step === "OTP") {
				leadEmailVerifyOtpMutate({
					email: decodedJWT.email,
					otp: values.otp,
				});
			} else if (step === "PASSWORD") {
				if (!validatePassword(values.password).allValid) {
					toast({
						description: "Password does not meet the requirements",
						title: "Error",
						variant: "destructive",
					});
					return;
				}

				if (values.password !== values.confirmPassword) {
					toast({
						description: "Passwords do not match",
						title: "Error",
						variant: "destructive",
					});
					return;
				}

				leadEmailVerifySetPasswordMutate({
					password: values.password,
					token: values.token,
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
		OTP: {
			cta: (
				<span>
					Please enter your one time password (OTP) sent to your email
					<strong className="text-black"> {decodedJWT.email}</strong>
				</span>
			),
			imageSrc: "/static/assets/auth/sign-in/credentials.svg",
			subtitle: "Welcome to Bwadl",
			title: "Hello!",
		},

		PASSWORD: {
			cta: "Please enter your password",
			imageSrc: "/static/assets/auth/sign-up/password.svg",
			title: "Create Password",
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
					{step === "OTP" && (
						<OTPStep
							loading={leadEmailVerifyOtpIsPending || leadEmailVerifyIsPending}
							value={values.otp}
							onChange={otp => setFieldValue("otp", otp)}
							onComplete={handleSubmit}
						/>
					)}

					{step === "PASSWORD" && (
						<PasswordStep
							confirmPassword={values.confirmPassword}
							loading={leadEmailVerifySetPasswordIsPending}
							password={values.password}
							onChangeConfirmPassword={confirmPassword => setFieldValue("confirmPassword", confirmPassword)}
							onChangePassword={password => setFieldValue("password", password)}
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
