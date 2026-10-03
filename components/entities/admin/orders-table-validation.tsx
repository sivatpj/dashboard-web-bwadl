import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMissingCRs } from "@/api/endpoints/back-office/missing-crs.api";
import { Icon } from "@/components/global/icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRandomId } from "@/lib/get-random-id";
import { cn } from "@/lib/utils";

type OrdersTableValidationProps = {
	data: any;
	setErrors: React.Dispatch<
		React.SetStateAction<Array<{ id: string; errors: Array<{ type: string; message: string }> }>>
	>;
};

export const OrdersTableValidation = (props: OrdersTableValidationProps) => {
	const { data, setErrors } = props;

	const params = useSearchParams();
	const highlightedRow = params.get("highlightedRow");

	const [formattedData, setFormattedData] = useState<any>([]);

	const { data: missingCRsData, isPending: missingCRsLoading } = useMissingCRs(
		data.map((item: any) => ({ crNumber: item["CR Number"] })),
		{ enabled: !!data },
	);

	const tableHeaders = [
		"CR Number",
		"Order Number",
		"Total order amount",
		"Merchant Name",
		"Total number of installments",
		"Total paid amount",
		"Order Status",
		"Installment amount",
		"Placing Order date",
		"Delivery Date",
		"Status",
	];

	const validateFields = (item: any, data: any, crNumbers: number[] = []) => {
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
		if (crNumbers.includes(item["CR Number"])) {
			crNumberErrors.push({ message: "Buyer does not exist", type: "Invalid CR Number" });
		}

		const orderNumberErrors = [];
		if (!item["Order Number"]) {
			orderNumberErrors.push({ message: "Order Number is required", type: "Format error" });
		}
		if (!/^[0-9]+$/.test(item["Order Number"])) {
			orderNumberErrors.push({ message: "CR Number must be numeric", type: "Format error" });
		}

		const orderAmountErrors = [];
		if (!item["Total order amount"]) {
			orderAmountErrors.push({ message: "Total order amount is required", type: "Format error" });
		}
		if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(item["Total order amount"])) {
			orderAmountErrors.push({ message: "Total order amount must be numeric", type: "Format error" });
		}
		if (parseFloat(item["Total order amount"]) <= 0) {
			orderAmountErrors.push({ message: "Total order amount must be greater than 0", type: "Format error" });
		}

		const merchantNameErrors = [];
		if (!item["Merchant Name"]) {
			merchantNameErrors.push({ message: "Merchant Name is required", type: "Format error" });
		}

		const totalInstallmentsErrors = [];
		if (!item["Total number of installments"]) {
			totalInstallmentsErrors.push({ message: "Total number of installments is required", type: "Format error" });
		}
		if (!/^[0-9]+$/.test(item["Total number of installments"])) {
			totalInstallmentsErrors.push({ message: "Total number of installments must be numeric", type: "Format error" });
		}
		if (parseInt(item["Total number of installments"]) < 1 || parseInt(item["Total number of installments"]) > 45) {
			totalInstallmentsErrors.push({
				message: "Total number of installments must be between 1 and 45",
				type: "Format error",
			});
		}

		const totalPaidAmountErrors = [];
		if (!item["Total paid amount"]) {
			totalPaidAmountErrors.push({ message: "Total paid amount is required", type: "Format error" });
		}
		if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(item["Total paid amount"])) {
			totalPaidAmountErrors.push({ message: "Total paid amount must be numeric", type: "Format error" });
		}
		if (parseFloat(item["Total paid amount"]) < 0) {
			totalPaidAmountErrors.push({ message: "Total paid amount must be greater than 0", type: "Format error" });
		}

		const orderStatusErrors = [];
		if (!item["Status"]) {
			orderStatusErrors.push({ message: "Order status is required", type: "Format error" });
		}
		if (["Completed", "In Progress", "Delivery Confirmation", "Cancelled"].includes(item["Status"].toLowerCase())) {
			orderStatusErrors.push({
				message: "Order status must be either Completed, In Progress, Delivery Confirmation, Cancelled",
				type: "Format error",
			});
		}

		const installmentAmountErrors = [];
		if (!item["Installment amount"]) {
			installmentAmountErrors.push({ message: "Installment amount is required", type: "Format error" });
		}
		if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(item["Installment amount"])) {
			installmentAmountErrors.push({ message: "Installment amount must be numeric", type: "Format error" });
		}
		if (parseFloat(item["Installment amount"]) <= 0) {
			installmentAmountErrors.push({ message: "Installment amount must be greater than 0", type: "Format error" });
		}

		const orderDateErrors = [];
		if (!item["Placing Order date"]) {
			orderDateErrors.push({ message: "Placing Order date is required", type: "Format error" });
		}
		if (!dayjs(item["Placing Order date"]).isValid()) {
			orderDateErrors.push({ message: "Placing Order date must be in D-MMM-Y format", type: "Format error" });
		}

		const deliveryDateErrors = [];
		if (item["Delivery Date"]) {
			if (!dayjs(item["Delivery Date"]).isValid()) {
				deliveryDateErrors.push({ message: "Delivery Date must be in D-MMM-Y format", type: "Format error" });
			}
		}

		const statusErrors = [];
		if (!item["Status"]) {
			statusErrors.push({ message: "Status is required", type: "Format error" });
		}
		if (["Active", "Inactive"].includes(item["Status"].toLowerCase())) {
			statusErrors.push({
				message: "Status must be either Active or Inactive",
				type: "Format error",
			});
		}

		return {
			crNumberErrors,
			deliveryDateErrors,
			installmentAmountErrors,
			merchantNameErrors,
			orderAmountErrors,
			orderDateErrors,
			orderNumberErrors,
			orderStatusErrors,
			statusErrors,
			totalInstallmentsErrors,
			totalPaidAmountErrors,
		};
	};

	useEffect(() => {
		if (!data || !missingCRsData?.success || missingCRsLoading) return;

		const errors: Array<{ id: string; errors: Array<{ type: string; message: string }> }> = [];

		setFormattedData(
			data?.map((item: any) => {
				const {
					crNumberErrors,
					orderNumberErrors,
					orderAmountErrors,
					merchantNameErrors,
					totalInstallmentsErrors,
					totalPaidAmountErrors,
					statusErrors,
					installmentAmountErrors,
					orderDateErrors,
					orderStatusErrors,
					deliveryDateErrors,
				} = validateFields(item, data, missingCRsData?.missing?.crNumbers);

				const crNumberId = getRandomId();
				const orderNumberId = getRandomId();
				const orderAmountId = getRandomId();
				const merchantNameId = getRandomId();
				const totalInstallmentsId = getRandomId();
				const totalPaidAmountId = getRandomId();
				const orderStatusId = getRandomId();
				const installmentAmountId = getRandomId();
				const orderDateId = getRandomId();
				const deliveryDateId = getRandomId();
				const statusId = getRandomId();

				if (crNumberErrors.length) errors.push({ errors: crNumberErrors, id: crNumberId });
				if (orderNumberErrors.length) errors.push({ errors: orderNumberErrors, id: orderNumberId });
				if (orderAmountErrors.length) errors.push({ errors: orderAmountErrors, id: orderAmountId });
				if (merchantNameErrors.length) errors.push({ errors: merchantNameErrors, id: merchantNameId });
				if (totalInstallmentsErrors.length) errors.push({ errors: totalInstallmentsErrors, id: totalInstallmentsId });
				if (totalPaidAmountErrors.length) errors.push({ errors: totalPaidAmountErrors, id: totalPaidAmountId });
				if (installmentAmountErrors.length) errors.push({ errors: installmentAmountErrors, id: installmentAmountId });
				if (orderDateErrors.length) errors.push({ errors: orderDateErrors, id: orderDateId });
				if (orderStatusErrors.length) errors.push({ errors: orderStatusErrors, id: orderStatusId });
				if (deliveryDateErrors.length) errors.push({ errors: deliveryDateErrors, id: deliveryDateId });
				if (statusErrors.length) errors.push({ errors: statusErrors, id: statusId });

				return {
					crNumber: {
						errors: crNumberErrors,
						id: crNumberId,
						value: item["CR Number"],
					},
					deliveryDate: {
						errors: deliveryDateErrors,
						id: deliveryDateId,
						value:
							item["Delivery Date"] && dayjs(item["Delivery Date"]).isValid()
								? dayjs(item["Delivery Date"]).format("DD-MMM-YYYY")
								: "",
					},
					id: getRandomId(),
					installmentAmount: {
						errors: installmentAmountErrors,
						id: installmentAmountId,
						value: item["Installment amount"],
					},
					merchantName: {
						errors: merchantNameErrors,
						id: merchantNameId,
						value: item["Merchant Name"],
					},
					orderAmount: {
						errors: orderAmountErrors,
						id: orderAmountId,
						value: item["Total order amount"],
					},
					orderDate: {
						errors: orderDateErrors,
						id: orderDateId,
						value:
							item["Placing Order date"] && dayjs(item["Placing Order date"]).isValid()
								? dayjs(item["Placing Order date"]).format("DD-MMM-YYYY")
								: "",
					},
					orderNumber: {
						errors: orderNumberErrors,
						id: orderNumberId,
						value: item["Order Number"],
					},
					orderStatus: {
						errors: orderStatusErrors,
						id: orderStatusId,
						value: item["Order Status"],
					},
					status: {
						errors: statusErrors,
						id: statusId,
						value: item["Status"],
					},
					totalInstallments: {
						errors: totalInstallmentsErrors,
						id: totalInstallmentsId,
						value: item["Total number of installments"],
					},
					totalPaidAmount: {
						errors: totalPaidAmountErrors,
						id: totalPaidAmountId,
						value: item["Total paid amount"],
					},
				};
			}),
		);

		setErrors(errors);
	}, [data, setErrors, missingCRsData, missingCRsLoading]);

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
								item.crNumber,
								item.orderNumber,
								item.orderAmount,
								item.merchantName,
								item.totalInstallments,
								item.totalPaidAmount,
								item.orderStatus,
								item.installmentAmount,
								item.orderDate,
								item.deliveryDate,
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
