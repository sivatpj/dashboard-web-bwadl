"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDeleteFinancierSupplierContract } from "@/api/endpoints/back-office/suppliers/financier-supplier-contracts/delete-financier-supplier-contract.api";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";

interface Props {
	contractId: number;
	trigger?: React.ReactNode;
}

export const DeleteContractPopUp = ({ contractId, trigger }: Props) => {
	const [open, setOpen] = useState(false);

	const { toast } = useToast();

	const queryClient = useQueryClient();
	const { t } = useTranslationContext();

	const { mutate, isPending } = useDeleteFinancierSupplierContract(
		{ id: contractId },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: ["back-office"],
				});
			},
			onSuccess: () => {
				toast({
					title: t("admin.financiers.delete-contract-success-title"),
					variant: "destructive",
				});
				setOpen(false);
			},
		},
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button
						className="ml-2 flex h-8 w-8 items-center justify-center rounded-md border border-transparent p-0 transition hover:border-red-600 hover:bg-red-50"
						variant="ghost"
						type="button"
						onClick={e => {
							e.stopPropagation();
							setOpen(true);
						}}
					>
						<Icon name="Bin" className="fill-red-600" />
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="h-auto w-[70%] bg-[#EAF4FB] p-0" onClick={e => e.stopPropagation()}>
				<div className="p-8">
					<div className="flex items-start gap-4">
						<div className="rounded-full bg-red-100 p-3">
							<Icon name="WarningTriangle" className="fill-red-600" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.financiers.delete-contract-title")}</h2>
							<p className="mt-4 text-lg text-gray-700">{t("admin.financiers.delete-contract-description")}</p>
						</div>
					</div>

					<div className="mt-8 flex justify-end gap-4">
						<Button
							className="h-10 w-[225px] border border-black bg-[#969696] text-[#000000] hover:bg-[#969696]"
							type="button"
							onClick={e => {
								e.stopPropagation();
								setOpen(false);
							}}
							disabled={isPending}
						>
							{t("admin.financiers.delete-contract-keep-button")}
						</Button>

						<Button
							className="h-10 w-[225px] bg-[#E05A5A] font-semibold text-white hover:bg-[#d14a4a]"
							type="button"
							onClick={e => {
								e.stopPropagation();
								mutate();
							}}
							loading={isPending}
						>
							{t("admin.financiers.delete-contract-confirm-button")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
