import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useFetchFinanciers } from "@/api/endpoints/back-office/financiers/fetch-financiers";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
import { useUpdateFinancierSupplierContract } from "@/api/endpoints/back-office/suppliers/financier-supplier-contracts/update-financier-supplier-contract.api";
import { IFinancierSupplierContract } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";
import { useForm } from "@/hooks/use-form";
import { useToast } from "@/hooks/use-toast";

interface EditContractProps extends IFinancierSupplierContract {}

export const EditContract = (props: EditContractProps) => {
	const { id, name, financierId, supplierId, advanceCap, availableAdvance, additionalInfo } = props;

	const { t } = useTranslationContext();

	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { data: financiersData } = useFetchFinanciers({}, { enabled: open });
	const { data: suppliersData } = useFetchSuppliers({}, { enabled: open });

	const { mutate, isPending } = useUpdateFinancierSupplierContract(
		{
			id,
		},
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
					queryKey: ["back-office", "financiers"],
				});
				queryClient.invalidateQueries({
					queryKey: ["back-office", "suppliers"],
				});
			},
			onSuccess: () => {
				setOpen(false);
			},
		},
	);

	const { setFieldValue, values, handleSubmit, resetForm, errors } = useForm<{
		name: string;
		advanceCap: number;
		availableAdvance: number;
		additionalInfo?: any;
		financierId: number;
		supplierId: number;
	}>({
		initialValues: {
			additionalInfo: additionalInfo || {},
			advanceCap: advanceCap || 0,
			availableAdvance: availableAdvance || 0,
			financierId: financierId || 0,
			name,
			supplierId: supplierId || 0,
		},
		onSubmit: values => {
			mutate(values);
		},
		validate(values) {
			const errors: Record<string, string> = {};

			if (!values.name) {
				errors.name = t("admin.suppliers.validation.contact-name");
			}

			if (!values.financierId) {
				errors.financierId = t("admin.suppliers.validation.financier-name");
			}

			if (!values.supplierId) {
				errors.supplierId = t("admin.suppliers.validation.supplier-name");
			}

			if (values.advanceCap < 0) {
				errors.advanceCap = t("admin.suppliers.validation.advance-cap");
			}

			return errors;
		},
		validateOnBlur: false,
		validateOnChange: false,
	});

	return (
		<Dialog
			open={open}
			onOpenChange={value => {
				setOpen(value);
				if (!value) resetForm();
			}}
		>
			<DialogTrigger asChild>
				<Button size="sm" onClick={() => setOpen(true)}>
					<Icon className="h-4 w-4 fill-white" name="Edit" />
					{t("admin.common.edit")}
				</Button>
			</DialogTrigger>

			<DialogContent className="h-auto w-[70%] rounded-xl p-0">
				<div className="rounded-md bg-[#EAF4FB] p-8">
					<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
						<div className="gap-6">
							<h2 className="text-2xl font-bold text-gray-900">{t("admin.suppliers.edit-contract")}</h2>
							<p className="text-sm text-gray-600">{t("admin.suppliers.fill-form")}</p>
						</div>

						<div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
							{/* <Input
								error={errors.name}
								label={t("admin.financiers.contract-name")}
								name="name"
								placeholder={t("admin.financiers.contract-name")}
								type="text"
								value={values.name}
								onChange={e => setFieldValue("name", e.target.value)}
							/> */}

							{/* <Select
								label={t("admin.suppliers.financier-name")}
								value={String(values.financierId)}
								onValueChange={v => setFieldValue("financierId", +v)}
							>
								<SelectTrigger error={errors.financierId}>
									<SelectValue placeholder={t("admin.suppliers.financier-name")} />
								</SelectTrigger>
								<SelectContent>
									{financiersData?.financiers.map(financier => (
										<SelectItem key={financier.id} value={String(financier.id)}>
											{financier.financierName} ({financier.crNumber})
										</SelectItem>
									))}
								</SelectContent>
							</Select> */}

							{/* <Select
								label={t("admin.suppliers.supplier-name")}
								value={String(values.supplierId)}
								onValueChange={v => setFieldValue("supplierId", +v)}
							>
								<SelectTrigger error={errors.supplierId}>
									<SelectValue placeholder={t("admin.suppliers.supplier-name")} />
								</SelectTrigger>
								<SelectContent>
									{suppliersData?.suppliers.map(supplier => (
										<SelectItem key={supplier.id} value={String(supplier.id)}>
											{supplier.supplierName} ({supplier.crNumber})
										</SelectItem>
									))}
								</SelectContent>
							</Select> */}

							<AmountInput
								error={errors.advanceCap}
								label={t("admin.financiers.advance-limit")}
								name="advanceCap"
								placeholder={t("admin.financiers.advance-limit")}
								value={values.advanceCap}
								onChange={value => setFieldValue("advanceCap", value)}
							/>

							<DateInput
								allowFutureDates
								dateOnly
								label={t("admin.financiers.contract-start-date")}
								name="contractStartDate"
								placeholder={t("admin.financiers.contract-start-date")}
								side="bottom"
								value={values.additionalInfo?.contractStartDate || ""}
								onChange={date =>
									setFieldValue("additionalInfo", {
										...values.additionalInfo,
										contractStartDate: date,
									})
								}
							/>

							<Input
								label={t("admin.financiers.comments")}
								name="comments"
								placeholder={t("admin.financiers.comments")}
								type="text"
								value={values.additionalInfo?.comments || ""}
								onChange={e =>
									setFieldValue("additionalInfo", {
										...values.additionalInfo,
										comments: e.target.value,
									})
								}
							/>
						</div>

						<div className="flex justify-end gap-3 pt-8">
							<Button
								className="w-[230px] bg-[#969696] hover:bg-[#969696]"
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								{t("admin.common.cancel")}
							</Button>

							<Button className="w-[230px] font-bold" loading={isPending} type="submit">
								{t("admin.common.save")}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
};
