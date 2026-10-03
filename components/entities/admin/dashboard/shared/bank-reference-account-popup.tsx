"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import {
	ParticipantType,
	useCreateBankReference,
	useFetchBankAccounts,
} from "@/api/endpoints/back-office/banks/fetch-bank-accounts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";

interface BankReferenceAccountPopUpProps {
	participantId: number;
	participantType: ParticipantType;
	mappedAccountCodes: string[];
	trigger: React.ReactNode;
}

export const BankReferenceAccountPopUp = (props: BankReferenceAccountPopUpProps) => {
	const { participantId, participantType, mappedAccountCodes, trigger } = props;

	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedAccountCode, setSelectedAccountCode] = useState<string | null>(null);

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const bankAccountsQuery = useFetchBankAccounts({ enabled: open });

	const filteredBanks = useMemo(() => {
		const banks = bankAccountsQuery.data?.banks ?? [];
		const term = search.trim().toLowerCase();
		if (!term) return banks;
		return banks.filter(bank =>
			[bank.shortName, bank.bankName, bank.accountCode].some(value => value?.toLowerCase().includes(term)),
		);
	}, [bankAccountsQuery.data?.banks, search]);

	const { mutate: createReference, isPending: isCreatingReference } = useCreateBankReference({
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
			setSelectedAccountCode(null);
			setSearch("");
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={value => {
				setOpen(value);
				if (!value) {
					setSelectedAccountCode(null);
					setSearch("");
				}
			}}
		>
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent className="flex max-h-[calc(100vh-2rem)] w-[min(90vw,520px)] flex-col bg-[#F0F8FD] p-0">
				<div className="flex min-h-0 flex-1 flex-col justify-between gap-4 rounded-[10px] bg-[#F0F8FD] px-8 py-8 shadow-lg">
					<div className="flex min-h-0 flex-1 flex-col gap-3">
						<div>
							<h2 className="text-2xl font-bold text-[#404040]">{t("admin.suppliers.reference-account")}</h2>
							<p className="mt-1 text-sm text-muted-foreground">{t("admin.suppliers.select-reference-account")}</p>
						</div>

						<Input placeholder="Search banks..." value={search} onChange={e => setSearch(e.target.value)} />

						<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-md border border-[#D5E1E9] bg-white p-2">
							{bankAccountsQuery.isPending ? (
								<>
									<Skeleton className="h-11 w-full" />
									<Skeleton className="h-11 w-full" />
									<Skeleton className="h-11 w-full" />
								</>
							) : filteredBanks.length ? (
								filteredBanks.map(bank => {
									const alreadyMapped = mappedAccountCodes.includes(bank.accountCode);
									const isSelected = selectedAccountCode === bank.accountCode;
									return (
										<button
											key={bank.accountCode}
											className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
												alreadyMapped
													? "cursor-not-allowed border-transparent bg-gray-50 text-gray-400"
													: isSelected
														? "border-[#2D8BC9] bg-[#EAF4FC] font-medium text-[#2D8BC9]"
														: "border-transparent bg-gray-50 text-[#404040] hover:bg-gray-100"
											}`}
											disabled={alreadyMapped}
											type="button"
											onClick={() => setSelectedAccountCode(bank.accountCode)}
										>
											<span className="flex min-w-0 flex-col">
												<span className="truncate">{bank.shortName || bank.bankName || bank.accountCode}</span>
												<span className="truncate text-xs text-gray-400">{bank.accountCode}</span>
											</span>

											{alreadyMapped ? (
												<span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
													Mapped
												</span>
											) : (
												isSelected && <Check className="h-4 w-4 shrink-0 text-[#2D8BC9]" />
											)}
										</button>
									);
								})
							) : (
								<p className="p-3 text-center text-sm text-gray-400">{t("admin.statements.no-results")}</p>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-4">
						<DialogClose asChild>
							<Button className="flex-1" type="button" variant="outline">
								{t("admin.common.cancel")}
							</Button>
						</DialogClose>

						<Button
							className="flex-1"
							disabled={!selectedAccountCode || isCreatingReference}
							type="button"
							onClick={() => {
								if (!selectedAccountCode) return;
								createReference({ accountCode: selectedAccountCode, participantId, participantType });
							}}
						>
							{t("admin.suppliers.reference-account")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
