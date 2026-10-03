"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDeleteSupplier } from "@/api/endpoints/back-office/suppliers/delete-supplier.api";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";

interface Props {
	supplierId: number;
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const DeleteSupplierPopUp = ({ supplierId, trigger, open: controlledOpen, onOpenChange }: Props) => {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen ?? internalOpen;
	const setOpen = (nextOpen: boolean) => {
		if (controlledOpen === undefined) {
			setInternalOpen(nextOpen);
		}
		onOpenChange?.(nextOpen);
	};
	const closingViaOutsideRef = useRef(false);
	const { toast } = useToast();

	const queryClient = useQueryClient();

	const { t } = useTranslationContext();

	const { mutate, isPending } = useDeleteSupplier(
		{ id: supplierId },
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
					title: t("admin.suppliers.delete-supplier-success-title"),
					variant: "destructive",
				});
				setOpen(false);
			},
		},
	);

	useEffect(() => {
		if (typeof document === "undefined") return;
		if (open) {
			document.body.setAttribute("data-ignore-row-active", "");
			return () => {
				document.body.removeAttribute("data-ignore-row-active");
			};
		}

		if (closingViaOutsideRef.current) {
			document.body.setAttribute("data-ignore-row-active", "");
			const t = window.setTimeout(() => {
				document.body.removeAttribute("data-ignore-row-active");
				closingViaOutsideRef.current = false;
			}, 150);
			return () => window.clearTimeout(t);
		}

		document.body.removeAttribute("data-ignore-row-active");
		return () => {
			document.body.removeAttribute("data-ignore-row-active");
		};
	}, [open]);

	const swallowNextBackgroundClick = () => {
		const opts: AddEventListenerOptions = { capture: true, once: true };
		const stop = (ev: Event) => {
			ev.preventDefault();
			ev.stopPropagation();
		};
		document.addEventListener("click", stop, opts);
		document.addEventListener("pointerup", stop, opts);
		document.addEventListener("mousedown", stop, opts);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{controlledOpen === undefined && (
				<DialogTrigger asChild>
					{trigger ?? (
						<Button
							data-ignore-row
							className="ml-2 h-8 w-8 p-0 flex items-center justify-center rounded-md border border-transparent hover:border-red-600 hover:bg-red-50 transition"
							variant="ghost"
							type="button"
							onPointerDownCapture={e => e.stopPropagation()}
							onMouseDown={e => e.stopPropagation()}
							onClick={e => {
								e.stopPropagation();
								setOpen(true);
							}}
							onKeyDown={e => {
								if (e.key === "Enter" || e.key === " ") {
									e.stopPropagation();
								}
							}}
						>
							<Icon name="Bin" className="fill-red-600" />
						</Button>
					)}
				</DialogTrigger>
			)}

			<DialogContent
				className="h-auto w-[70%] bg-[#EAF4FB] p-0"
				onPointerDownOutside={e => {
					e.preventDefault();
					e.stopPropagation();
					closingViaOutsideRef.current = true;
					swallowNextBackgroundClick();
					setOpen(false);
				}}
			>
				<div className="p-8">
					<div className="flex items-start gap-4">
						<div className="rounded-full bg-red-100 p-3">
							<Icon name="WarningTriangle" className="fill-red-600" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.suppliers.delete-supplier-title")}</h2>
							<p className="mt-4 text-lg text-gray-700">{t("admin.suppliers.delete-supplier-description")}</p>
						</div>
					</div>

					<div className="mt-8 flex justify-end gap-4">
						<Button
							className="h-10 w-[225px] border border-black bg-[#969696] text-[#000000] hover:bg-[#969696]"
							type="button"
							onClick={() => setOpen(false)}
							disabled={isPending}
						>
							{t("admin.suppliers.delete-supplier-keep-button")}
						</Button>

						<Button
							className="h-10 w-[225px] bg-[#E05A5A] font-semibold text-white hover:bg-[#d14a4a]"
							type="button"
							onClick={() => {
								mutate();
							}}
							loading={isPending}
						>
							{t("admin.suppliers.delete-supplier-confirm-button")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
