import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { IAdminUser } from "@/api/endpoints/back-office/users/fetch-users";
import { useUpdateUser } from "@/api/endpoints/back-office/users/update-user.api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MobileInput } from "@/components/ui/mobile-input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { validatePassword } from "@/lib/validate-password";
import { IDENTITY_TYPES } from "./identity-types";

interface Props {
	user: IAdminUser;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UserEditPopUp({ user, open, onOpenChange }: Props) {
	const { t } = useTranslationContext();

	const [isResettingPassword, setIsResettingPassword] = useState(false);

	const queryClient = useQueryClient();

	const { toast } = useToast();

	const { mutate, isPending } = useUpdateUser(
		{ userId: user._id },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: ["back-office", "users"] });
			},
			onSuccess: () => {
				onOpenChange(false);
			},
		},
	);

	const { setFieldValue, values, handleSubmit, errors, resetForm } = useForm<{
		nameEn: string;
		nameAr: string;
		email: string;
		mobile: string;
		identityId: string;
		identityType: string;
		isEmailVerified: boolean;
		isMobileVerified: boolean;
		isUserVerified: boolean;
		password: string;
		confirmPassword: string;
	}>({
		initialValues: {
			confirmPassword: String(),
			email: user.email || String(),
			identityId: user.identity?.id || String(),
			identityType: user.identity?.type || String(),
			isEmailVerified: !!user.isEmailVerified,
			isMobileVerified: !!user.isMobileVerified,
			isUserVerified: !!user.isUserVerified,
			mobile: user.mobile || String(),
			nameAr: user.nameAr || String(),
			nameEn: user.nameEn || String(),
			password: String(),
		},
		onSubmit: values => {
			const payload: Record<string, unknown> = {
				email: values.email || undefined,
				identity:
					values.identityId || values.identityType
						? { id: values.identityId || undefined, type: values.identityType || undefined }
						: undefined,
				isEmailVerified: values.isEmailVerified,
				isMobileVerified: values.isMobileVerified,
				isUserVerified: values.isUserVerified,
				mobile: values.mobile || undefined,
				nameAr: values.nameAr || undefined,
				nameEn: values.nameEn,
			};

			if (values.password || values.confirmPassword) {
				payload.password = values.password;
				payload.confirmPassword = values.confirmPassword;
			}

			mutate(payload);
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.nameEn) {
				errors.nameEn = t("admin.users.validation.name-en");
			}

			if (!values.email && !values.mobile) {
				errors.email = t("admin.users.validation.email-or-mobile");
				errors.mobile = t("admin.users.validation.email-or-mobile");
			}

			if (values.email && !/.+@.+\..+/.test(values.email)) {
				errors.email = t("admin.users.validation.email");
			}

			if (values.password || values.confirmPassword) {
				if (!validatePassword(values.password).allValid) {
					errors.password = t("admin.users.validation.password");
				}

				if (values.confirmPassword !== values.password) {
					errors.confirmPassword = t("admin.users.validation.confirm-password");
				}
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	const validation = validatePassword(values.password);
	const isChangingPassword = values.password.length > 0 || values.confirmPassword.length > 0;

	const rules = [
		{ id: "minLength", label: t("admin.header.change-password.rule-min-length") },
		{ id: "uppercase", label: t("admin.header.change-password.rule-uppercase") },
		{ id: "lowercase", label: t("admin.header.change-password.rule-lowercase") },
		{ id: "numeric", label: t("admin.header.change-password.rule-numeric") },
		{ id: "special", label: t("admin.header.change-password.rule-special") },
	] as const;

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				if (!next) resetForm();
				onOpenChange(next);
			}}
		>
			<DialogContent className="h-auto w-[80%] max-w-3xl bg-[#F0F8FD]">
				<form className="flex h-full w-full flex-col" onSubmit={handleSubmit}>
					<div className="relative mb-6 flex items-start justify-between gap-4">
						<div>
							<h2 className="text-2xl font-bold">{t("admin.users.edit-user")}</h2>
							<p className="text-muted-foreground">{t("admin.users.please-fill-the-following-form-to-edit-user")}</p>
						</div>

						{!isResettingPassword ? (
							<Button
								className="shrink-0"
								size="sm"
								type="button"
								variant="outline"
								onClick={() => setIsResettingPassword(true)}
							>
								{t("admin.users.reset-password")}
							</Button>
						) : (
							<Button
								className="shrink-0"
								size="sm"
								type="button"
								variant="outline"
								onClick={() => {
									setFieldValue("password", "");
									setFieldValue("confirmPassword", "");
									setIsResettingPassword(false);
								}}
							>
								{t("admin.common.cancel")}
							</Button>
						)}
					</div>

					<div className="flex-1">
						<div className="grid grid-cols-2 gap-x-8 gap-y-4">
							<Input
								className="mt-1"
								error={errors.nameEn}
								label={t("admin.users.name-en")}
								placeholder={t("admin.users.name-en-placeholder")}
								value={values.nameEn}
								onChange={e => setFieldValue("nameEn", e.target.value)}
							/>

							<Input
								className="mt-1"
								error={errors.nameAr}
								label={t("admin.users.name-ar")}
								placeholder={t("admin.users.name-ar-placeholder")}
								value={values.nameAr}
								onChange={e => setFieldValue("nameAr", e.target.value)}
							/>

							<Input
								className="mt-1"
								error={errors.email}
								label={t("admin.users.email")}
								placeholder={t("admin.users.email-placeholder")}
								value={values.email}
								onChange={e => setFieldValue("email", e.target.value)}
							/>

							<MobileInput
								className="mt-1"
								error={errors.mobile}
								label={t("admin.users.mobile")}
								placeholder={t("admin.users.mobile-placeholder")}
								value={values.mobile}
								onChange={e => setFieldValue("mobile", e.target.value)}
							/>

							<Select
								className="mt-1"
								label={t("admin.users.identity-type")}
								value={values.identityType || undefined}
								onValueChange={value => setFieldValue("identityType", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("admin.users.identity-type-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									{IDENTITY_TYPES.map(option => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Input
								className="mt-1"
								label={t("admin.users.identity-id")}
								placeholder={t("admin.users.identity-id-placeholder")}
								value={values.identityId}
								onChange={e => setFieldValue("identityId", e.target.value)}
							/>

							{isResettingPassword && (
								<>
									<PasswordInput
										className="mt-1"
										error={errors.password}
										label={t("admin.users.new-password")}
										placeholder={t("admin.users.new-password-placeholder")}
										value={values.password}
										onChange={e => setFieldValue("password", e.target.value)}
									/>

									<PasswordInput
										className="mt-1"
										error={errors.confirmPassword}
										label={t("admin.users.confirm-password")}
										placeholder={t("admin.users.confirm-password-placeholder")}
										value={values.confirmPassword}
										onChange={e => setFieldValue("confirmPassword", e.target.value)}
									/>
								</>
							)}
						</div>

						<div className="mt-4 rounded-xl border border-gray-100 bg-white p-5">
							<p className="mb-3 text-sm font-semibold text-gray-800">{t("admin.users.verification-flags")}</p>
							<div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
								<label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
									<input
										checked={values.isEmailVerified}
										className="h-4 w-4 accent-[#404040]"
										type="checkbox"
										onChange={e => setFieldValue("isEmailVerified", e.target.checked)}
									/>
									{t("admin.users.is-email-verified")}
								</label>
								<label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
									<input
										checked={values.isMobileVerified}
										className="h-4 w-4 accent-[#404040]"
										type="checkbox"
										onChange={e => setFieldValue("isMobileVerified", e.target.checked)}
									/>
									{t("admin.users.is-mobile-verified")}
								</label>
								<label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
									<input
										checked={values.isUserVerified}
										className="h-4 w-4 accent-[#404040]"
										type="checkbox"
										onChange={e => setFieldValue("isUserVerified", e.target.checked)}
									/>
									{t("admin.users.is-user-verified")}
								</label>
							</div>
						</div>

						{isChangingPassword && (
							<div className="mt-4 rounded-xl border border-gray-100 bg-white p-5">
								<p className="mb-3 text-sm font-semibold text-gray-800">
									{t("admin.header.change-password.requirements-title")}
								</p>
								<div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
									{rules.map(rule => {
										const valid = validation[rule.id as keyof typeof validation];
										return (
											<div key={rule.id} className="flex items-center gap-2 text-sm">
												{valid ? (
													<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
												) : (
													<Circle className="h-4 w-4 shrink-0 text-gray-300" />
												)}
												<span className={cn(valid ? "text-emerald-700" : "text-gray-500")}>{rule.label}</span>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>

					<div className="mt-6 flex justify-end gap-4">
						<Button
							className="w-[230px] bg-[#969696] hover:bg-[#969696]"
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button className="w-[230px] font-bold" loading={isPending} type="submit">
							{t("admin.common.save")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
