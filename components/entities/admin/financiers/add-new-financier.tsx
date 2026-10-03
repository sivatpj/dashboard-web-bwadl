import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useCreateFinancier } from "@/api/endpoints/back-office/financiers/create-financier.api";
import { useUpdateFinancier } from "@/api/endpoints/back-office/financiers/update-financier.api";
import { IFinancier } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { CrNumberInput } from "@/components/ui/cr-number-input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MobileInput } from "@/components/ui/mobile-input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface AddNewFinancierProps {
	financier?: IFinancier | null;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export interface FinancierTableRow {
	crNumber: string;
	facilityName: string;
	financierName: string;
	contact: string;
	limit: number;
}

export const AddNewFinancier = ({ financier, open: controlledOpen, onOpenChange }: AddNewFinancierProps) => {
	const { t } = useTranslationContext();

	const [internalOpen, setInternalOpen] = useState(false);

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;

	const setOpen = (value: boolean) => {
		if (isControlled) {
			onOpenChange?.(value);
		} else {
			setInternalOpen(value);
		}
	};

	const isEditMode = !!financier;

	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { mutate, isPending } = useCreateFinancier({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "financiers"] });
		},
		onSuccess: () => {
			setOpen(false);
			resetForm();
		},
	});

	const { mutate: updateFinancier, isPending: isUpdatePending } = useUpdateFinancier(
		{ id: financier?.id ?? 0 },
		{
			onError: err => {
				toast({
					description: err.response?.data.error || t("admin.common.something-went-wrong"),
					title: t("admin.common.error"),
					variant: "destructive",
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: ["back-office", "financiers"] });
			},
			onSuccess: () => {
				setOpen(false);
				resetForm();
			},
		},
	);

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		crNumber: number;
		facilityName: string;
		financierName: string;
		additionalInfo?: any;
		limit: number;
		contactNumber: string;
		email: string;
	}>({
		initialValues: {
			additionalInfo: {},
			contactNumber: String(),
			crNumber: Number(),
			email: String(),
			facilityName: String(),
			financierName: String(),
			limit: Number(),
		},
		onSubmit: values => {
			if (isEditMode) {
				updateFinancier({
					additionalInfo: {
						...(financier.additionalInfo ?? {}),
						email: values.email,
						phone: values.contactNumber,
					},
					contactNumber: values.contactNumber,
					crNumber: values.crNumber,
					email: values.email,
					facilityName: values.facilityName,
					financierName: values.financierName,
					limit: values.limit,
				});
			} else {
				mutate({
					...values,
					additionalInfo: {
						...(values.additionalInfo ?? {}),
						email: values.email,
						phone: values.contactNumber,
					},
				});
			}
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (values.crNumber?.toString().length !== 10) {
				errors.crNumber = t("admin.financiers.validation.cr-number");
			}

			if (!values.facilityName) {
				errors.facilityName = t("admin.financiers.validation.facility-name");
			}

			if (!values.financierName) {
				errors.financierName = t("admin.financiers.validation.financier-name");
			}

			if (values.limit && values.limit <= 0) {
				errors.limit = t("admin.financiers.validation.limit");
			}

			if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
				errors.email = t("admin.financiers.validation.email");
			}

			if (values.contactNumber && !/^05\d{8}$/.test(values.contactNumber)) {
				errors.contactNumber = t("admin.financiers.validation.contact-number");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	useEffect(() => {
		if (open && isEditMode) {
			setFieldValue("crNumber", financier.crNumber);
			setFieldValue("facilityName", financier.facilityName);
			setFieldValue("financierName", financier.financierName);
			setFieldValue("limit", financier.limit);
			setFieldValue(
				"contactNumber",
				financier.additionalInfo?.phone || financier.additionalInfo?.contact || financier.additionalInfo?.contactNumber || "",
			);
			setFieldValue(
				"email",
				financier.additionalInfo?.email || financier.additionalInfo?.emailAddress || financier.additionalInfo?.email_address || "",
			);
		}
	}, [open, isEditMode]);

	const content = (
		<DialogContent className="max-h-[90vh] w-[70%] overflow-y-auto p-0">
			<div className="rounded-md bg-[#EAF4FB] p-8">
				<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
					<div className="gap-6">
						<h2 className="text-2xl font-bold text-gray-900">
							{isEditMode ? t("admin.financiers.edit-financier") : t("admin.financiers.add-new-financier")}
						</h2>
						<p className="text-sm text-gray-600">
							{isEditMode
								? t("admin.financiers.edit-financier-description")
								: t("admin.financiers.add-new-financier-description")}
						</p>
					</div>

					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<CrNumberInput
							error={errors.crNumber}
							label={t("admin.financiers.cr-number")}
							name="crNumber"
							placeholder={t("admin.financiers.cr-number-placeholder")}
							value={values.crNumber}
							onChange={value => setFieldValue("crNumber", value)}
						/>

						<Input
							error={errors.facilityName}
							label={t("admin.financiers.facility-name")}
							name="facilityName"
							placeholder={t("admin.financiers.facility-name-placeholder")}
							type="text"
							value={values.facilityName}
							onChange={e => setFieldValue("facilityName", e.target.value)}
						/>

						<Input
							error={errors.financierName}
							label={t("admin.financiers.financier-name")}
							name="financierName"
							placeholder={t("admin.financiers.financier-name-placeholder")}
							type="text"
							value={values.financierName}
							onChange={e => setFieldValue("financierName", e.target.value)}
						/>

						<AmountInput
							error={errors.limit}
							label={t("admin.financiers.limit")}
							placeholder={t("admin.financiers.limit-placeholder")}
							value={values.limit}
							onChange={value => setFieldValue("limit", value)}
						/>

						<MobileInput
							error={errors.contactNumber}
							label={t("admin.financiers.contact-number")}
							placeholder={t("admin.financiers.contact-number-placeholder")}
							value={values.contactNumber}
							onChange={e => setFieldValue("contactNumber", e.target.value)}
						/>

						<Input
							error={errors.email}
							label={t("admin.financiers.email")}
							name="email"
							placeholder={t("admin.financiers.email-placeholder")}
							type="email"
							value={values.email}
							onChange={e => setFieldValue("email", e.target.value)}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							className="h-10 w-[20%] rounded-md border border-[#404040] bg-white px-6 text-gray-800 hover:bg-white"
							type="button"
							onClick={() => setOpen(false)}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button
							className="h-10 w-[20%] rounded-md bg-[#404040] font-semibold text-white hover:bg-[#2f2f2f]"
							disabled={isPending || isUpdatePending}
							type="submit"
						>
							{isEditMode ? t("admin.common.save") : t("admin.financiers.add-financier")}
						</Button>
					</div>
				</form>
			</div>
		</DialogContent>
	);

	if (isControlled) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				{content}
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-48">
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.financiers.add-new-financier")}
				</Button>
			</DialogTrigger>
			{content}
		</Dialog>
	);
};
