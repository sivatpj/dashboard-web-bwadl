import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { validate as validateEmail } from "email-validator";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMissingCRs } from "@/api/endpoints/back-office/missing-crs.api";
import { Icon } from "@/components/global/icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRandomId } from "@/lib/get-random-id";
import { cn } from "@/lib/utils";

type UsersTableValidationProps = {
	data: any;
	setErrors: React.Dispatch<
		React.SetStateAction<Array<{ id: string; errors: Array<{ type: string; message: string }> }>>
	>;
};

export const UsersTableValidation = (props: UsersTableValidationProps) => {
	const { data, setErrors } = props;

	const params = useSearchParams();
	const highlightedRow = params.get("highlightedRow");

	const [formattedData, setFormattedData] = useState<any>([]);

	const { data: missingCRsData, isPending: missingCRsLoading } = useMissingCRs(
		data.map((item: any) => ({ crNumber: item["CR Number"] })),
		{ enabled: !!data },
	);

	const tableHeaders = ["CR Number", "Full Name", "ID", "Email", "Mobile", "Status"];

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

		const idErrors = [];
		if (!item["ID"]) {
			idErrors.push({ message: "ID is required", type: "Format error" });
		}
		if (`${item["ID"]}`.length !== 10) {
			idErrors.push({ message: "ID must be 10 digits", type: "Format error" });
		}
		if (!/^[0-9]+$/.test(item["ID"])) {
			idErrors.push({ message: "ID must be numeric", type: "Format error" });
		}
		if (data.filter((i: any) => i["ID"] === item["ID"]).length > 1) {
			idErrors.push({ message: "ID must be unique", type: "Duplicate error" });
		}

		const nameErrors = [];
		if (!item["Full Name"]) {
			nameErrors.push({ message: "Full Name is required", type: "Format error" });
		}
		if (/\d/.test(item["Full Name"])) {
			nameErrors.push({ message: "Full Name must not contain numbers", type: "Format error" });
		}

		const emailErrors = [];
		if (!item["Email"]) {
			emailErrors.push({ message: "Email is required", type: "Format error" });
		}
		if (!validateEmail(item["Email"])) {
			emailErrors.push({ message: "Email is not valid", type: "Format error" });
		}
		if (data.filter((i: any) => i["Email"] === item["Email"]).length > 1) {
			emailErrors.push({ message: "Email must be unique", type: "Duplicate error" });
		}

		const mobileErrors = [];
		if (!item["Mobile"]) {
			mobileErrors.push({ message: "Mobile is required", type: "Format error" });
		}
		if (`${item["Mobile"]}`.length !== 10) {
			mobileErrors.push({ message: "Mobile must be 10 digits", type: "Format error" });
		}
		if (!/^[0-9]+$/.test(item["Mobile"])) {
			mobileErrors.push({ message: "Mobile must be numeric", type: "Format error" });
		}
		if (data.filter((i: any) => i["Mobile"] === item["Mobile"]).length > 1) {
			mobileErrors.push({ message: "Mobile must be unique", type: "Duplicate error" });
		}

		const statusErrors = [];
		if (!item["Status"]) {
			statusErrors.push({ message: "Status is required", type: "Format error" });
		}
		if (["Active", "Inactive"].includes(item["Status"].toLowerCase())) {
			statusErrors.push({ message: "Status must be either Active or Inactive", type: "Format error" });
		}

		return {
			crNumberErrors,
			emailErrors,
			idErrors,
			mobileErrors,
			nameErrors,
			statusErrors,
		};
	};

	useEffect(() => {
		if (!data || !missingCRsData?.success || missingCRsLoading) return;

		const errors: Array<{ id: string; errors: Array<{ type: string; message: string }> }> = [];

		setFormattedData(
			data?.map((item: any) => {
				const { crNumberErrors, statusErrors, nameErrors, emailErrors, idErrors, mobileErrors } = validateFields(
					item,
					data,
					missingCRsData?.missing?.crNumbers,
				);

				const crNumberId = getRandomId();
				const statusId = getRandomId();
				const fullNameId = getRandomId();
				const emailId = getRandomId();
				const idId = getRandomId();
				const mobileId = getRandomId();

				if (crNumberErrors.length) errors.push({ errors: crNumberErrors, id: crNumberId });
				if (statusErrors.length) errors.push({ errors: statusErrors, id: statusId });
				if (nameErrors.length) errors.push({ errors: nameErrors, id: fullNameId });
				if (emailErrors.length) errors.push({ errors: emailErrors, id: emailId });
				if (idErrors.length) errors.push({ errors: idErrors, id: idId });
				if (mobileErrors.length) errors.push({ errors: mobileErrors, id: mobileId });

				return {
					crNumber: {
						errors: crNumberErrors,
						id: crNumberId,
						value: item["CR Number"],
					},
					email: {
						errors: emailErrors,
						id: emailId,
						value: item["Email"],
					},
					fullName: {
						errors: nameErrors,
						id: fullNameId,
						value: item["Full Name"],
					},
					id: getRandomId(),
					idNumber: {
						errors: idErrors,
						id: idId,
						value: item["ID"],
					},
					mobile: {
						errors: mobileErrors,
						id: mobileId,
						value: item["Mobile"],
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
							{[item.crNumber, item.fullName, item.idNumber, item.email, item.mobile, item.status].map(
								(value, index) => (
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
								),
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
