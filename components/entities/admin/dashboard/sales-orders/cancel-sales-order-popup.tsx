"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useCancelSalesOrder } from "@/api/endpoints/back-office/sales-orders/cancel-sales-order.api";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";

interface CancelSalesOrderPopupProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCancelled?: () => void;
	salesOrderId: number;
}

export const CancelSalesOrderPopup = ({
	open,
	onOpenChange,
	onCancelled,
	salesOrderId,
}: CancelSalesOrderPopupProps) => {
	const closingViaOutsideRef = useRef(false);
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const { t } = useTranslationContext();

	const { mutate, isPending } = useCancelSalesOrder(
		{ id: salesOrderId },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: ["back-office"] });
			},
			onSuccess: () => {
				toast({
					title: t("admin.sales-orders.cancel-sales-order-success-title"),
					variant: "destructive",
				});
				onOpenChange(false);
				onCancelled?.();
			},
		},
	);

	useEffect(() => {
		if (typeof document === "undefined") return;
		if (open) {
			document.body.setAttribute("data-ignore-row-active", "");
			return () => document.body.removeAttribute("data-ignore-row-active");
		}

		if (closingViaOutsideRef.current) {
			document.body.setAttribute("data-ignore-row-active", "");
			const timer = window.setTimeout(() => {
				document.body.removeAttribute("data-ignore-row-active");
				closingViaOutsideRef.current = false;
			}, 150);
			return () => window.clearTimeout(timer);
		}

		document.body.removeAttribute("data-ignore-row-active");
		return () => document.body.removeAttribute("data-ignore-row-active");
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="h-auto w-[70%] bg-[#EAF4FB] p-0"
				onPointerDownOutside={e => {
					e.preventDefault();
					e.stopPropagation();
					closingViaOutsideRef.current = true;
					swallowNextBackgroundClick();
					onOpenChange(false);
				}}
			>
				<div className="p-8">
					<div className="flex items-start gap-4">
						<div className="rounded-full bg-red-100 p-3">
							<Icon className="fill-red-600" name="WarningTriangle" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.sales-orders.cancel-sales-order-title")}</h2>
							<p className="mt-4 text-lg text-gray-700">{t("admin.sales-orders.cancel-sales-order-description")}</p>
						</div>
					</div>

					<div className="mt-8 flex justify-end gap-4">
						<Button
							className="h-10 w-[225px] border border-black bg-[#969696] text-[#000000] hover:bg-[#969696]"
							type="button"
							onClick={() => onOpenChange(false)}
						>
							{t("admin.sales-orders.cancel-sales-order-keep-button")}
						</Button>

						<Button
							className="h-10 w-[225px] bg-[#E05A5A] font-semibold text-white hover:bg-[#d14a4a]"
							loading={isPending}
							type="button"
							onClick={() => mutate({})}
						>
							{t("admin.sales-orders.cancel-sales-order-confirm-button")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
