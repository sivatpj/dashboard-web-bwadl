"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useUpdateAccountOverdraft } from "@/api/endpoints/back-office/accounting/fetch-accounts";
import { IAccount } from "@/api/types";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/global/icon";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EditOverdraftDialogProps {
	account: IAccount | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const EditOverdraftDialog = (props: EditOverdraftDialogProps) => {
	const { account, open, onOpenChange } = props;

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const [allowsOverdraft, setAllowsOverdraft] = useState(false);
	const [overdraftLimit, setOverdraftLimit] = useState<number>(0);

	useEffect(() => {
		if (account && open) {
			setAllowsOverdraft(Boolean(account.allowsOverdraft));
			setOverdraftLimit(account.overdraftLimit ?? 0);
		}
	}, [account, open]);

	const { mutate: updateOverdraft, isPending } = useUpdateAccountOverdraft(account?.id, {
		onError: (err: any) => {
			toast({
				description: err.response?.data?.message || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSuccess: () => {
			toast({ title: t("admin.accounts.update-success") });
			queryClient.invalidateQueries({ queryKey: ["back-office", "accounting", "accounts"] });
			onOpenChange(false);
		},
	});

	const handleSave = () => {
		updateOverdraft({
			allowsOverdraft,
			overdraftLimit: allowsOverdraft ? overdraftLimit || null : null,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[720px] max-w-[95vw] gap-0 rounded-xl border-none bg-white p-0 shadow-2xl">
				{/* Header */}
				<div className="flex items-start gap-4 border-b border-[#EEF0F2] px-5 py-5 sm:px-8 sm:py-6">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#EAF4FB]">
						<Icon className="size-5" name="Accounts" />
					</div>
					<div className="flex flex-col gap-1">
						<h2 className="text-xl font-bold text-gray-900">{t("admin.accounts.edit-overdraft-settings")}</h2>
						<p className="text-sm text-gray-500">{t("admin.accounts.edit-overdraft-settings-description")}</p>
					</div>
				</div>

				{/* Body */}
				<div className="flex flex-col gap-5 px-5 py-5 sm:px-8 sm:py-6">
					{account && (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-1 rounded-[8px] bg-[#F6F8FA] px-4 py-3">
								<span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
									{t("admin.accounts.account-code")}
								</span>
								<span className="break-words text-sm font-semibold text-gray-900">{account.accountCode}</span>
							</div>
							<div className="flex flex-col gap-1 rounded-[8px] bg-[#F6F8FA] px-4 py-3">
								<span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
									{t("admin.accounts.account-name")}
								</span>
								<span className="break-words text-sm font-semibold text-gray-900">{account.accountName}</span>
							</div>
						</div>
					)}

					<div
						className={cn(
							"flex items-center justify-between rounded-[8px] border px-5 py-4 transition-colors",
							allowsOverdraft ? "border-[#4B9CC5]/30 bg-[#EAF4FB]" : "border-[#EEF0F2] bg-[#F6F8FA]",
						)}
					>
						<div className="flex flex-col">
							<span className="text-sm font-semibold text-gray-900">{t("admin.accounts.allows-overdraft")}</span>
							<span className={cn("text-xs font-medium", allowsOverdraft ? "text-[#4B9CC5]" : "text-gray-400")}>
								{allowsOverdraft ? t("admin.accounts.yes") : t("admin.accounts.no")}
							</span>
						</div>
						<Switch
							checked={allowsOverdraft}
							onCheckedChange={checked => {
								setAllowsOverdraft(checked);
								if (!checked) setOverdraftLimit(0);
							}}
						/>
					</div>

					<AmountInput
						disabled={!allowsOverdraft}
						label={t("admin.accounts.overdraft-limit")}
						min={0}
						placeholder={t("admin.accounts.overdraft-limit-placeholder")}
						value={overdraftLimit}
						onChange={setOverdraftLimit}
					/>
				</div>

				{/* Footer */}
				<div className="flex flex-col-reverse gap-3 border-t border-[#EEF0F2] px-5 py-5 sm:flex-row sm:justify-end sm:px-8">
					<Button className="w-full sm:w-auto" disabled={isPending} type="button" variant="outline" onClick={() => onOpenChange(false)}>
						{t("admin.accounts.cancel")}
					</Button>
					<Button className="w-full sm:w-auto" loading={isPending} type="button" onClick={handleSave}>
						{t("admin.accounts.save")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
