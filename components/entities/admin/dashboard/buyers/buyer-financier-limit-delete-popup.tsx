"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDeleteBuyerFinancierLimit } from "@/api/endpoints/back-office/buyers/delete-buyer-financier-limit.api";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";

interface BuyerFinancierLimitDeletePopUpProps {
	buyerId: number;
	financierId: number;
	financierName: string;
	trigger: React.ReactNode;
}

export const BuyerFinancierLimitDeletePopUp = (props: BuyerFinancierLimitDeletePopUpProps) => {
	const { buyerId, financierId, financierName, trigger } = props;

	const [open, setOpen] = useState(false);

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useDeleteBuyerFinancierLimit(
		{ financierId, id: buyerId },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["back-office", "buyers", String(buyerId), "financier-limits"] });
				setOpen(false);
			},
		},
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent className="h-auto w-[min(90vw,600px)] bg-[#EAF4FB] p-0">
				<div className="p-8">
					<div className="flex items-start gap-4">
						<div className="rounded-full bg-red-100 p-3">
							<Icon name="WarningTriangle" className="fill-red-600" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">
								{t("admin.buyers.delete-buyer-financier-limit-title")}
							</h2>
							<p className="mt-4 text-lg text-gray-700">
								{t("admin.buyers.delete-buyer-financier-limit-description", { name: financierName })}
							</p>
						</div>
					</div>

					<div className="mt-8 flex justify-end gap-4">
						<Button
							className="h-10 w-[180px] border border-black bg-[#969696] text-[#000000] hover:bg-[#969696]"
							disabled={isPending}
							type="button"
							onClick={() => setOpen(false)}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button
							className="h-10 w-[180px] bg-[#E05A5A] font-semibold text-white hover:bg-[#d14a4a] disabled:opacity-50"
							disabled={isPending}
							loading={isPending}
							type="button"
							onClick={() => mutate()}
						>
							Delete
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
