"use client";

import { CheckCircle2, Circle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useChangePassword } from "@/api/endpoints/authentication/change-password.api";
import { useFetchWhoAmI } from "@/api/endpoints/fetch-who-am-i";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/contexts/auth";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { validatePassword } from "@/lib/validate-password";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface PasswordInputProps {
	id: string;
	name?: string;
	autoComplete: string;
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
}

const PasswordInput = ({ id, name, autoComplete, placeholder, value, onChange }: PasswordInputProps) => {
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative">
			<Input
				autoComplete={autoComplete}
				className="h-12 w-full rounded-lg border-gray-300 pr-11 text-[15px] focus-visible:border-[#404040] focus-visible:ring-1 focus-visible:ring-[#404040]"
				id={id}
				name={name}
				placeholder={placeholder}
				type={visible ? "text" : "password"}
				value={value}
				onChange={e => onChange(e.target.value)}
			/>
			<button
				aria-label={visible ? "Hide password" : "Show password"}
				className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-400 transition-colors hover:text-gray-700"
				tabIndex={-1}
				type="button"
				onClick={() => setVisible(prev => !prev)}
			>
				{visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
			</button>
		</div>
	);
};

export const ChangePasswordDialog = ({ open, onOpenChange }: Props) => {
	const { t } = useTranslationContext();
	const { toast } = useToast();
	const { refreshToken } = useAuthContext();
	const { data: whoAmIData } = useFetchWhoAmI();

	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const validation = validatePassword(newPassword);
	const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
	const isDifferentFromOld = oldPassword.length === 0 || newPassword !== oldPassword;
	const showMismatch = confirmPassword.length > 0 && !passwordsMatch;

	const canSubmit = oldPassword.length > 0 && validation.allValid && passwordsMatch && isDifferentFromOld;

	const resetState = () => {
		setOldPassword("");
		setNewPassword("");
		setConfirmPassword("");
	};

	const { mutate, isPending } = useChangePassword({
		onError: err => {
			const message = err.response?.data.error || t("admin.common.something-went-wrong");
			toast({
				description: message,
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSuccess: response => {
			if (response.token) refreshToken(response.token);
			toast({ title: t("admin.header.change-password.success"), variant: "success" });
			resetState();
			onOpenChange(false);
		},
	});

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!canSubmit || !whoAmIData?.user._id) return;
		mutate({
			userId: whoAmIData.user._id,
			password: oldPassword,
			newpassword: newPassword,
		});
	};

	const rules = [
		{ id: "minLength", label: t("admin.header.change-password.rule-min-length") },
		{ id: "uppercase", label: t("admin.header.change-password.rule-uppercase") },
		{ id: "lowercase", label: t("admin.header.change-password.rule-lowercase") },
		{ id: "numeric", label: t("admin.header.change-password.rule-numeric") },
		{ id: "special", label: t("admin.header.change-password.rule-special") },
	] as const;

	const isRuleDifferentValid = isDifferentFromOld && oldPassword.length > 0 && newPassword.length > 0;

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				if (!nextOpen) resetState();
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="w-[95%] max-w-2xl gap-0 rounded-2xl p-0">
				<DialogHeader className="flex flex-row items-center gap-4 space-y-0 border-b border-gray-100 px-8 py-6">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#404040]/10">
						<ShieldCheck className="h-6 w-6 text-[#404040]" />
					</div>
					<div>
						<DialogTitle className="text-xl font-semibold text-gray-900">
							{t("admin.header.change-password.title")}
						</DialogTitle>
						<p className="mt-0.5 text-sm text-gray-500">{t("admin.header.change-password.subtitle")}</p>
					</div>
				</DialogHeader>

				<form autoComplete="off" onSubmit={handleSubmit}>
				<div className="max-h-[70vh] overflow-y-auto px-8 py-6">
					<div className="space-y-6">
						<div>
							<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="old-password">
								{t("admin.header.change-password.old-password")}
							</label>
							<PasswordInput
								autoComplete="bwadl-no-suggest"
								id="old-password"
								name="bwadl-old-password"
								placeholder={t("admin.header.change-password.old-password")}
								value={oldPassword}
								onChange={setOldPassword}
							/>
						</div>

						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="new-password">
									{t("admin.header.change-password.new-password")}
								</label>
								<PasswordInput
									autoComplete="bwadl-no-suggest"
									id="new-password"
									name="bwadl-new-password"
									placeholder={t("admin.header.change-password.new-password")}
									value={newPassword}
									onChange={setNewPassword}
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="confirm-password">
									{t("admin.header.change-password.confirm-password")}
								</label>
								<PasswordInput
									autoComplete="bwadl-no-suggest"
									id="confirm-password"
									name="bwadl-confirm-password"
									placeholder={t("admin.header.change-password.confirm-password")}
									value={confirmPassword}
									onChange={setConfirmPassword}
								/>
								{showMismatch && (
									<p className="mt-1.5 text-xs font-medium text-red-600">
										{t("admin.header.change-password.mismatch")}
									</p>
								)}
							</div>
						</div>

						<div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-5">
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
								<div className="flex items-center gap-2 text-sm">
									{isRuleDifferentValid ? (
										<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
									) : (
										<Circle className="h-4 w-4 shrink-0 text-gray-300" />
									)}
									<span className={cn(isRuleDifferentValid ? "text-emerald-700" : "text-gray-500")}>
										{t("admin.header.change-password.rule-different")}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-3 border-t border-gray-100 px-8 py-5">
					<Button
						className="h-11 rounded-lg border border-gray-300 bg-white px-6 font-medium text-black hover:bg-gray-50"
						disabled={isPending}
						type="button"
						onClick={() => onOpenChange(false)}
					>
						{t("admin.header.change-password.cancel")}
					</Button>
					<Button
						className="h-11 rounded-lg bg-[#404040] px-6 font-medium text-white hover:bg-[#404040]/90 disabled:opacity-40"
						disabled={!canSubmit || isPending}
						loading={isPending}
						type="submit"
					>
						{t("admin.header.change-password.submit")}
					</Button>
				</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
