import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCreateSupplier } from "@/api/endpoints/back-office/suppliers/create-supplier.api";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { CrNumberInput } from "@/components/ui/cr-number-input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { isValidSaudiMobile, MobileInput } from "@/components/ui/mobile-input";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

export function SupplierAddPopUp() {
	const { t } = useTranslationContext();

	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();

	const { toast } = useToast();

	const { mutate, isPending } = useCreateSupplier({
		onError: err => {
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["back-office", "suppliers"] });
		},
		onSuccess: () => {
			setOpen(false);
			resetForm();
		},
	});

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		crNumber: number;
		facilityName: string;
		supplierName: string;
		deliveryDateOffsetDays: number;
		additionalInfo?: any;
		limit: number;
		allowsOverdraft?: boolean;
		phone?: string;
	}>({
		initialValues: {
			additionalInfo: {},
			allowsOverdraft: true,
			crNumber: Number(),
			deliveryDateOffsetDays: Number(),
			facilityName: String(),
			limit: 0,
			supplierName: String(),
		},
		onSubmit: values => {
			const payload: any = { ...values, allowsOverdraft: values.allowsOverdraft === true };
			mutate(payload);
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (values.crNumber?.toString().length !== 10) {
				errors.crNumber = t("admin.suppliers.validation.cr-number");
			}

			if (!values.facilityName) {
				errors.facilityName = t("admin.suppliers.validation.facility-name");
			}

			if (!values.supplierName) {
				errors.supplierName = t("admin.suppliers.validation.supplier-name");
			}

			if (values.deliveryDateOffsetDays < 0) {
				errors.deliveryDateOffsetDays = t("admin.suppliers.validation.delivery-date-offset");
			}

			if (values.limit && values.limit <= 0) {
				errors.limit = t("admin.suppliers.validation.limit");
			}

			if (values.additionalInfo?.phone && !isValidSaudiMobile(values.additionalInfo.phone)) {
				errors.phone = t("admin.suppliers.validation.contact-number");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-48" onClick={() => setOpen(true)}>
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.suppliers.add-new-supplier")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-auto w-[80%] bg-[#F0F8FD]">
				<form className="flex h-full w-full flex-col" onSubmit={handleSubmit}>
					<div className="relative mb-6">
						<h2 className="text-2xl font-bold">{t("admin.suppliers.add-new-supplier")}</h2>
						<p className="text-muted-foreground">
							{t("admin.suppliers.please-fill-the-following-form-to-add-new-supplier")}
						</p>
					</div>

					<div className="flex-1">
						<div className="grid grid-cols-2 gap-x-8 gap-y-4">
							
							<CrNumberInput
								className="mt-1"
								error={errors.crNumber}
								label={t("admin.suppliers.cr-number")}
								placeholder={t("admin.suppliers.cr-number-placeholder")}
								value={values.crNumber === 0 ? "" : values.crNumber}
								onChange={value => setFieldValue("crNumber", value)}
							/>

							<Input
								className="mt-1"
								error={errors.facilityName}
								label={t("admin.suppliers.facility-name")}
								placeholder={t("admin.suppliers.facility-name-placeholder")}
								value={values.facilityName}
								onChange={e => setFieldValue("facilityName", e.target.value)}
							/>

							<Input
								className="mt-1"
								error={errors.supplierName}
								label={t("admin.suppliers.supplier-name")}
								placeholder={t("admin.suppliers.supplier-name-placeholder")}
								value={values.supplierName}
								onChange={e => setFieldValue("supplierName", e.target.value)}
							/>

						{/* 	<Input
								className="mt-1"
								label={t("admin.suppliers.financial-share")}
								placeholder={t("admin.suppliers.financial-share-placeholder")}
								type="text"
								value={values.additionalInfo?.financialShare || ""}
								onChange={e => {
									const val = e.target.value.replace(/[^0-9.]/g, "");
									const sanitized = val.split(".").length > 2 ? val.slice(0, val.lastIndexOf(".")) : val;
									setFieldValue("additionalInfo", { ...values.additionalInfo, financialShare: sanitized });
								}}
							/> */}


							<AmountInput
								className="mt-1"
								error={errors.limit}
								label={t("admin.suppliers.limit")}
								placeholder={t("admin.suppliers.limit-placeholder")}
								value={values.limit}
								onChange={value => setFieldValue("limit", value)}
							/>

						{/* 	<Input
								className="mt-1"
								error={errors.deliveryDateOffsetDays}
								icon={t("admin.suppliers.days")}
								label={t("admin.suppliers.delivery-date-offset")}
								min={0}
								placeholder={t("admin.suppliers.delivery-date-offset-placeholder")}
								type="number"
								value={values.deliveryDateOffsetDays === 0 ? "" : values.deliveryDateOffsetDays}
								onChange={e => setFieldValue("deliveryDateOffsetDays", +e.target.value)}
							/> */}

							<MobileInput
								className="mt-1"
								error={errors.phone}
								label={t("admin.suppliers.phone-number")}
								placeholder={t("admin.suppliers.phone-number-placeholder")}
								value={values.additionalInfo?.phone || ""}
								onChange={e => setFieldValue("additionalInfo", { ...values.additionalInfo, phone: e.target.value })}
							/>

							<Input
								className="mt-1"
								label={t("admin.suppliers.email-address")}
								placeholder={t("admin.suppliers.email-address-placeholder")}
								value={values.additionalInfo?.email || ""}
								onChange={e => setFieldValue("additionalInfo", { ...values.additionalInfo, email: e.target.value })}
							/>

							<div className="flex flex-col gap-1.5">
								<label className="text-sm font-medium text-gray-700">
									{t("admin.suppliers.allow-overdraft")}
								</label>
								<div className="flex gap-4">
									<label className="flex cursor-pointer items-center gap-2">
										<input
											checked={values.allowsOverdraft === true}
											className="h-4 w-4 accent-[#404040]"
											name="allowsOverdraft"
											type="radio"
											value="yes"
											onChange={() => setFieldValue("allowsOverdraft", true)}
										/>
										<span className="text-sm text-gray-700">Yes</span>
									</label>
									<label className="flex cursor-pointer items-center gap-2">
										<input
											checked={values.allowsOverdraft !== true}
											className="h-4 w-4 accent-[#404040]"
											name="allowsOverdraft"
											type="radio"
											value="no"
											onChange={() => setFieldValue("allowsOverdraft", false)}
										/>
										<span className="text-sm text-gray-700">No</span>
									</label>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-auto flex justify-end gap-4 pt-6">
						<Button
							className="w-[230px] bg-[#969696] hover:bg-[#969696]"
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							{t("admin.common.cancel")}
						</Button>

						<Button className="w-[230px] font-bold" loading={isPending} type="submit">
							{t("admin.suppliers.add-supplier")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
