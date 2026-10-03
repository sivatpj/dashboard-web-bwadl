import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/global/icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format-currency";
import { getRandomId } from "@/lib/get-random-id";
import { cn } from "@/lib/utils";

type CRTableValidationProps = {
	data: any;
	setErrors: React.Dispatch<
		React.SetStateAction<Array<{ id: string; errors: Array<{ type: string; message: string }> }>>
	>;
};

export const CRTableValidation = (props: CRTableValidationProps) => {
	const { data, setErrors } = props;

	const params = useSearchParams();
	const highlightedRow = params.get("highlightedRow");

	const [formattedData, setFormattedData] = useState<any>([]);

	const tableHeaders = [
		"CR Name",
		"CR Number",
		"Limit",
		"Repayment Period",
		"No of Installment",
		"Office Contact Number",
		"CR Address",
		"Status",
	];

	const validateFields = (item: any, data: any) => {
		const crNameErrors = [];
		if (!item["CR Name"]) {
			crNameErrors.push({ message: "CR Name is required", type: "Format error" });
		}
		if (data.filter((i: any) => i["CR Name"] === item["CR Name"]).length > 1) {
			crNameErrors.push({ message: "CR Name must be unique", type: "Format error" });
		}

		const crNumberErrors = [];
		if (!item["CR Number"]) {
			crNumberErrors.push({ message: "CR Number is required", type: "Format error" });
		}
		if (`${item["CR Number"]}`.length !== 10) {
			crNumberErrors.push({ message: "CR Number must be 10 digits", type: "Format error" });
		}
		if (!/^[0-9]+$/.test(item["CR Number"])) {
			crNumberErrors.push({ message: "CR Number must be numeric", type: "Format error" });
		}
		if (data.filter((i: any) => i["CR Number"] === item["CR Number"]).length > 1) {
			crNumberErrors.push({ message: "CR Number must be unique", type: "Duplicate error" });
		}

		const limitErrors = [];
		if (!item["Limit"]) {
			limitErrors.push({ message: "Limit is required", type: "Format error" });
		}
		if (item["Limit"] <= 0) {
			limitErrors.push({ message: "Limit must be greater than 0", type: "Format error" });
		}
		if (!/^[0-9]+$/.test(item["Limit"])) {
			limitErrors.push({ message: "Limit must be numeric", type: "Format error" });
		}

		const repaymentPeriodErrors = [];
		if (!item["Repayment Period"]) {
			repaymentPeriodErrors.push({ message: "Repayment Period is required", type: "Format error" });
		}
		if (item["Repayment Period"] <= 0) {
			repaymentPeriodErrors.push({ message: "Repayment Period must be greater than 0", type: "Format error" });
		}
		if (!/^[0-9]+$/.test(item["Repayment Period"])) {
			repaymentPeriodErrors.push({ message: "Repayment Period must be numeric", type: "Format error" });
		}

		const numberOfInstallmentsErrors = [];
		if (!item["No of Installment"]) {
			numberOfInstallmentsErrors.push({ message: "No of Installment is required", type: "Format error" });
		}
		if (item["No of Installment"] <= 0) {
			numberOfInstallmentsErrors.push({ message: "No of Installment must be greater than 0", type: "Format error" });
		}
		if (!/^[0-9]+$/.test(item["No of Installment"])) {
			numberOfInstallmentsErrors.push({ message: "No of Installment must be numeric", type: "Format error" });
		}

		const officeContactNumberErrors = [];
		if (!item["Office contact number"]) {
			officeContactNumberErrors.push({ message: "Office Contact Number is required", type: "Format error" });
		}
		if (`${item["Office contact number"]}`.length !== 10) {
			officeContactNumberErrors.push({ message: "Office Contact Number must be 10 digits", type: "Format error" });
		}
		if (!/^[0-9]+$/.test(item["Office contact number"])) {
			officeContactNumberErrors.push({ message: "Office Contact Number must be numeric", type: "Format error" });
		}

		const crAddressErrors = [];
		if (!item["CR Address"]) {
			crAddressErrors.push({ message: "CR Address is required", type: "Format error" });
		}

		const statusErrors = [];
		if (!item["Status"]) {
			statusErrors.push({ message: "Status is required", type: "Format error" });
		}
		if (!["Active", "Inactive"].includes(item["Status"])) {
			statusErrors.push({ message: "Status must be either Active or Inactive", type: "Format error" });
		}

		return {
			crAddressErrors,
			crNameErrors,
			crNumberErrors,
			limitErrors,
			numberOfInstallmentsErrors,
			officeContactNumberErrors,
			repaymentPeriodErrors,
			statusErrors,
		};
	};

	useEffect(() => {
		const errors: Array<{ id: string; errors: Array<{ type: string; message: string }> }> = [];

		setFormattedData(
			data?.map((item: any) => {
				const {
					crNameErrors,
					crNumberErrors,
					limitErrors,
					repaymentPeriodErrors,
					numberOfInstallmentsErrors,
					officeContactNumberErrors,
					crAddressErrors,
					statusErrors,
				} = validateFields(item, data);

				const crNameId = getRandomId();
				const crNumberId = getRandomId();
				const limitId = getRandomId();
				const repaymentPeriodId = getRandomId();
				const numberOfInstallmentsId = getRandomId();
				const officeContactNumberId = getRandomId();
				const crAddressId = getRandomId();
				const statusId = getRandomId();

				if (crNameErrors.length) errors.push({ errors: crNameErrors, id: crNameId });
				if (crNumberErrors.length) errors.push({ errors: crNumberErrors, id: crNumberId });
				if (limitErrors.length) errors.push({ errors: limitErrors, id: limitId });
				if (repaymentPeriodErrors.length) errors.push({ errors: repaymentPeriodErrors, id: repaymentPeriodId });
				if (numberOfInstallmentsErrors.length)
					errors.push({ errors: numberOfInstallmentsErrors, id: numberOfInstallmentsId });
				if (officeContactNumberErrors.length)
					errors.push({ errors: officeContactNumberErrors, id: officeContactNumberId });
				if (crAddressErrors.length) errors.push({ errors: crAddressErrors, id: crAddressId });
				if (statusErrors.length) errors.push({ errors: statusErrors, id: statusId });

				return {
					crAddress: {
						errors: crAddressErrors,
						id: crAddressId,
						value: item["CR Address"],
					},
					crName: {
						errors: crNameErrors,
						id: crNameId,
						value: item["CR Name"],
					},
					crNumber: {
						errors: crNumberErrors,
						id: crNumberId,
						value: item["CR Number"],
					},
					id: getRandomId(),
					limit: {
						errors: limitErrors,
						id: limitId,
						value: item["Limit"],
					},
					numberOfInstallments: {
						errors: numberOfInstallmentsErrors,
						id: numberOfInstallmentsId,
						value: item["No of Installment"],
					},
					officeContactNumber: {
						errors: officeContactNumberErrors,
						id: officeContactNumberId,
						value: item["Office contact number"],
					},
					repaymentPeriod: {
						errors: repaymentPeriodErrors,
						id: repaymentPeriodId,
						value: item["Repayment Period"],
					},
					status: {
						errors: statusErrors,
						id: statusId,
						value: item["Status"],
					},
				};
			}),
		);

		setErrors(errors);
	}, [data, setErrors]);

	useEffect(() => {
		if (highlightedRow) {
			const el = document.getElementById(highlightedRow);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	}, [highlightedRow]);

	return (
		<div className="h-full flex-1 overflow-auto rounded-lg">
			<Table>
				<TableHeader className="sticky top-0 z-10 bg-[#D9D9D9]">
					<TableRow>
						{tableHeaders.map((header, index) => (
							<TableHead key={`table-header-${index}`} className="text-left font-bold text-[#141919]">
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>

				<TableBody className="sticky top-0 h-10 w-full rounded-t-md border-b-2 border-border bg-white">
					{formattedData?.map((item: any) => (
						<TableRow key={item.id}>
							{[
								item.crName,
								item.crNumber,
								{
									...item.limit,
									prefix: <Icon name="Riyal" />,
									value: formatCurrency(item.limit.value),
								},
								item.repaymentPeriod,
								item.numberOfInstallments,
								item.officeContactNumber,
								item.crAddress,
								item.status,
							].map((value, index) => (
								<TableCell
									key={`table-cell-${index}-${value.id}`}
									className={cn(
										value.id === highlightedRow ? "animate-pulse bg-red-400" : value.errors.length && "bg-red-300",
										"font-light text-[#141919]",
									)}
									id={value.id}
								>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger className="flex w-full items-center gap-2">
												{!!value.errors.length && <Icon name="WarningTriangle" />}
												{value.prefix}
												{value.value}
											</TooltipTrigger>
											<TooltipContent>
												{!!value.errors.length && (
													<div className="flex flex-col rounded-lg bg-white p-2 text-[#141919] shadow-md">
														{value.errors.map((error: any, index: number) => (
															<span
																key={`error-${index}-${error.type}-${error.message}-${value.id}`}
																className="text-sm"
															>
																- {error.message}
															</span>
														))}
													</div>
												)}
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
