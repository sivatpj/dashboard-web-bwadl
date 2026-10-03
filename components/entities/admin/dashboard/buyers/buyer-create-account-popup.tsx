"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateBuyerAccount } from "@/api/endpoints/back-office/buyers/create-buyer-account.api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

const ENGLISH_NAME_REGEX = /^[A-Za-z ]*$/;

interface BuyerCreateAccountPopUpProps {
	buyerId: number;
	trigger: React.ReactNode;
}

const purposeLabel = (purpose: "cash" | "payable") => (purpose === "cash" ? "Cash" : "Payable");

export const BuyerCreateAccountPopUp = (props: BuyerCreateAccountPopUpProps) => {
	const { buyerId, trigger } = props;

	const [open, setOpen] = useState(false);

	const { t } = useTranslationContext();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useCreateBuyerAccount(
		{ id: buyerId },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["back-office", "buyers", String(buyerId)] });
				setOpen(false);
				resetForm();
			},
		},
	);

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		buyerNameEnglish: string;
		purpose: "cash" | "payable" | "";
	}>({
		initialValues: {
			buyerNameEnglish: "",
			purpose: "cash",
		},
		onSubmit: values => {
			mutate({
				buyerNameEnglish: values.buyerNameEnglish.trim(),
				purpose: values.purpose as "cash" | "payable",
			});
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.buyerNameEnglish.trim()) {
				errors.buyerNameEnglish = "Buyer name is required";
			} else if (values.buyerNameEnglish.trim().length > 100) {
				errors.buyerNameEnglish = "Buyer name must not exceed 100 characters";
			} else if (!ENGLISH_NAME_REGEX.test(values.buyerNameEnglish)) {
				errors.buyerNameEnglish = "Buyer name must contain English alphabets only";
			}

			if (!values.purpose) {
				errors.purpose = "Purpose is required";
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	const purposeLabelValue = values.purpose ? purposeLabel(values.purpose) : "<Purpose>";
	const nameValue = values.buyerNameEnglish.trim() || "<Buyer Short Name English>";
	const nameValueNoSpaces = nameValue.replace(/\s+/g, "");

	const generatedAccountName = `SAR BUYER ${nameValueNoSpaces} ${purposeLabelValue} Account`;
	const generatedAccountDescription = `${nameValue} Liability ${purposeLabelValue} Account in SAR`;

	return (
		<Dialog
			open={open}
			onOpenChange={value => {
				setOpen(value);
				if (!value) resetForm();
			}}
		>
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent className="flex max-h-[calc(100vh-2rem)] w-[min(90vw,600px)] flex-col bg-[#F0F8FD] p-0">
				<form className="flex min-h-0 w-full flex-col gap-6 p-6 sm:p-8" onSubmit={handleSubmit}>
					<div className="shrink-0">
						<h2 className="text-2xl font-bold text-[#404040]">Create Account</h2>
					</div>

					<div className="grid min-h-0 flex-1 grid-cols-1 gap-x-10 gap-y-5 overflow-y-auto pr-2">
						<Input
							error={errors.buyerNameEnglish}
							label="Buyer Short Name in English"
							maxLength={100}
							placeholder="Enter buyer short name in English"
							value={values.buyerNameEnglish}
							onChange={e => {
								const value = e.target.value;
								if (ENGLISH_NAME_REGEX.test(value) && value.length <= 100) {
									setFieldValue("buyerNameEnglish", value);
								}
							}}
						/>

						<Select
							disabled
							label="Purpose"
							value={values.purpose}
							onValueChange={value => setFieldValue("purpose", value as "cash" | "payable")}
						>
							<SelectTrigger error={errors.purpose}>
								<SelectValue placeholder="Select purpose" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="cash">Cash</SelectItem>
								<SelectItem value="payable">Payable</SelectItem>
							</SelectContent>
						</Select>

						<Input disabled label="Account Code" readOnly value={generatedAccountName} />

						<Input disabled label="Account Description" readOnly value={generatedAccountDescription} />
					</div>

					<div className="flex shrink-0 flex-col justify-end gap-2 border-t border-[#D5E1E9] pt-4 sm:flex-row">
						<Button
							className="w-full px-16 font-semibold sm:w-auto"
							type="button"
							variant="outline"
							onClick={() => {
								resetForm();
								setOpen(false);
							}}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button
							className="w-full px-16 font-semibold sm:w-auto"
							disabled={isPending || !values.buyerNameEnglish.trim() || !values.purpose}
							type="submit"
						>
							Create Account
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
