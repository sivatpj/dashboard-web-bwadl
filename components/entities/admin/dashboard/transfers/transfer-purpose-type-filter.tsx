"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	useCreateTransferPurposeType,
	useDeleteTransferPurposeType,
	useFetchTransferPurposeTypes,
} from "@/api/endpoints/back-office/banks/transfer-purpose-types.api";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";

const PURPOSE_TYPES_QUERY_KEY = ["back-office", "banks", "purpose-types"];

export const TransferPurposeTypeFilter = ({
	value,
	onChange,
}: {
	value?: string;
	onChange: (value: string | null) => void;
}) => {
	const { t } = useTranslationContext();
	const { data } = useFetchTransferPurposeTypes();

	return (
		<div className="flex items-stretch overflow-hidden rounded-sm border shadow-sm">
			<Select value={value || "all"} onValueChange={v => onChange(v === "all" ? null : v)}>
				<SelectTrigger className="h-auto w-auto min-w-[180px] rounded-none border-none bg-white px-4 py-2 shadow-none">
					<SelectValue placeholder={t("admin.transfers.all-purpose-types")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{t("admin.transfers.all-purpose-types")}</SelectItem>
					{data?.purposeTypes.map(purposeType => (
						<SelectItem key={purposeType.id} value={String(purposeType.id)}>
							{purposeType.purposeType}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export const TransferPurposeTypeManagePopup = () => {
	const [open, setOpen] = useState(false);
	const [newPurposeType, setNewPurposeType] = useState("");
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

	const queryClient = useQueryClient();
	const { t } = useTranslationContext();
	const { toast } = useToast();

	const { data, isPending } = useFetchTransferPurposeTypes();

	const { mutate: create, isPending: isCreating } = useCreateTransferPurposeType({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSuccess: () => {
			setNewPurposeType("");
			queryClient.invalidateQueries({ queryKey: PURPOSE_TYPES_QUERY_KEY });
		},
	});

	const { mutate: remove } = useDeleteTransferPurposeType({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.transfers.delete-purpose-type-error"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			setDeletingId(null);
			setConfirmDeleteId(null);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PURPOSE_TYPES_QUERY_KEY });
		},
	});

	const handleAdd = () => {
		const trimmed = newPurposeType.trim();
		if (!trimmed) return;
		create({ purposeType: trimmed });
	};

	const handleConfirmDelete = (id: number) => {
		setDeletingId(id);
		remove(id);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				setOpen(nextOpen);
				if (!nextOpen) setConfirmDeleteId(null);
			}}
		>
			<DialogTrigger asChild>
				<button
					aria-label={t("admin.transfers.add-purpose-type")}
					className="flex items-center justify-center border-l bg-white px-3 text-[#404040] hover:bg-[#F5F5F5]"
					title={t("admin.transfers.add-purpose-type")}
					type="button"
				>
					<Icon className="h-4 w-4" name="PlusBox" />
				</button>
			</DialogTrigger>

			<DialogContent className="grid max-h-[85vh] w-[95vw] grid-rows-[auto_auto_1fr] gap-0 overflow-hidden bg-[#F0F8FD] p-5 sm:w-full sm:max-w-xl sm:p-8 md:max-w-2xl">
				<div>
					<h2 className="text-xl font-bold sm:text-2xl">{t("admin.transfers.purpose-types")}</h2>
				</div>

				<div className="flex flex-col items-stretch gap-2 pt-4 sm:flex-row sm:items-end sm:gap-3 sm:pt-6">
					<Input
						className="flex-1"
						inputClassName="h-12 text-base sm:h-14"
						label={t("admin.transfers.purpose-type")}
						placeholder={t("admin.transfers.purpose-type-placeholder")}
						value={newPurposeType}
						onChange={e => setNewPurposeType(e.target.value)}
					/>
					<Button
						className="h-12 sm:h-14 sm:px-8"
						disabled={!newPurposeType.trim()}
						loading={isCreating}
						type="button"
						onClick={handleAdd}
					>
						{t("admin.transfers.add-purpose-type")}
					</Button>
				</div>

				<ScrollArea className="mt-4 min-h-0 sm:mt-6">
					<div className="flex flex-col gap-3 pb-1 pr-4">
						{!isPending && data?.purposeTypes.length === 0 && (
							<p className="text-sm text-muted-foreground">{t("admin.statements.no-results")}</p>
						)}
						{data?.purposeTypes.map(purposeType => (
							<div
								key={purposeType.id}
								className="flex items-center justify-between rounded-[8px] border bg-white px-4 py-3 sm:px-5 sm:py-4"
							>
								<span className="text-sm sm:text-base">{purposeType.purposeType}</span>
								<button
									aria-label={t("admin.common.delete")}
									className="text-muted-foreground hover:text-red-500 disabled:opacity-50"
									type="button"
									onClick={() => setConfirmDeleteId(purposeType.id)}
								>
									<Icon className="h-5 w-5" name="DeletePopup" />
								</button>
							</div>
						))}
					</div>
				</ScrollArea>
			</DialogContent>

			<Dialog open={confirmDeleteId !== null} onOpenChange={nextOpen => !nextOpen && setConfirmDeleteId(null)}>
				<DialogContent className="w-full max-w-lg bg-[#F0F8FD] p-8">
					<div className="flex flex-col gap-6">
						<h2 className="text-2xl font-bold">{t("admin.transfers.confirm-delete-purpose-type-title")}</h2>
						<p className="text-base text-muted-foreground">
							{t("admin.transfers.confirm-delete-purpose-type", {
								name: data?.purposeTypes.find(p => p.id === confirmDeleteId)?.purposeType ?? "",
							})}
						</p>

						<div className="flex justify-end gap-4">
							<Button
								className="h-14 w-[160px] bg-[#969696] text-base hover:bg-[#808080]"
								type="button"
								variant="outline"
								onClick={() => setConfirmDeleteId(null)}
							>
								{t("admin.common.cancel")}
							</Button>
							<Button
								className="h-14 w-[160px] text-base"
								loading={deletingId === confirmDeleteId}
								type="button"
								variant="destructive"
								onClick={() => confirmDeleteId !== null && handleConfirmDelete(confirmDeleteId)}
							>
								{t("admin.common.delete")}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</Dialog>
	);
};
