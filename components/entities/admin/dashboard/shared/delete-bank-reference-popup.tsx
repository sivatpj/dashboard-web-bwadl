"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	ParticipantType,
	useDeleteBankReference,
} from "@/api/endpoints/back-office/banks/fetch-bank-accounts";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";

interface DeleteBankReferencePopUpProps {
	participantId: number;
	participantType: ParticipantType;
	accountCode: string;
	bankLabel: string;
}

export const DeleteBankReferencePopUp = (props: DeleteBankReferencePopUpProps) => {
	const { participantId, participantType, accountCode, bankLabel } = props;

	const [open, setOpen] = useState(false);

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useDeleteBankReference({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["back-office", "banks", "accounts", "reference", participantId, participantType],
			});
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-transparent hover:border-red-600 hover:bg-red-50 transition"
					type="button"
					variant="ghost"
					onClick={e => e.stopPropagation()}
				>
					<Icon name="Bin" className="fill-red-600" />
				</Button>
			</DialogTrigger>

			<DialogContent className="w-[min(95vw,560px)] rounded-2xl bg-white p-0 shadow-xl">
				<div className="flex flex-col items-center gap-4 px-8 py-9 text-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
						<Icon className="h-6 w-6 fill-red-600" name="WarningTriangle" />
					</div>

					<div className="flex flex-col gap-1.5 px-2">
						<h2 className="text-lg font-bold text-gray-900">Remove Reference Account</h2>
						<p className="text-sm leading-relaxed text-gray-500">
							Are you sure you want to remove <span className="font-medium text-gray-700">{bankLabel}</span>{" "}
							<span className="text-gray-400">({accountCode})</span> as a reference account?
						</p>
					</div>

					<div className="mt-2 flex w-full gap-3">
						<Button
							className="h-10 flex-1 border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50"
							disabled={isPending}
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button
							className="h-10 flex-1 bg-[#E05A5A] font-semibold text-white hover:bg-[#d14a4a]"
							loading={isPending}
							type="button"
							onClick={() => mutate({ accountCode, participantId, participantType })}
						>
							Remove
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
