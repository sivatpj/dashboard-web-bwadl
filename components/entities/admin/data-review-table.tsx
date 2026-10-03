import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useBuyersUpload } from "@/api/endpoints/back-office/buyers-upload.api";
import { useInstallmentsUpload } from "@/api/endpoints/back-office/installments-upload.api";
import { useOrdersUpload } from "@/api/endpoints/back-office/orders-upload.api";
import { useUsersUpload } from "@/api/endpoints/back-office/users-upload.api";
import { Icon } from "@/components/global/icon";
import { useSetParams } from "@/hooks/use-set-params";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CRTableValidation } from "./CR-table-validation";
import { InstallmentsTableValidation } from "./installments-table-validation";
import { OrdersTableValidation } from "./orders-table-validation";
import { UploadConfirmation } from "./upload-confirmation";
import { UploadItem } from "./upload-item";
import { UsersTableValidation } from "./users-table-validation";

type Data = {
	crs?: any;
	users?: any;
	orders?: any;
	installments?: any;
};

type DataReviewTableProps = {
	fileIsValid?: boolean;
	setFileIsValid?: (isValid: boolean) => void;
	data: Data;
	removeUpload: (type: keyof Data) => void;
	handleUpload: (type: keyof Data, data: any) => void;
};

export const DataReviewTable = (props: DataReviewTableProps) => {
	const { data, handleUpload, removeUpload, fileIsValid, setFileIsValid } = props;

	const [errors, setErrors] = useState<Array<{ id: string; errors: Array<{ type: string; message: string }> }>>([]);

	const setParams = useSetParams();
	const router = useRouter();

	const { toast } = useToast();

	const params = useSearchParams();
	const highlightedRow = params.get("highlightedRow");

	const onSuccess = () => {
		toast({
			description: "Data has been uploaded successfully",
			title: "Success",
			variant: "default",
		});
		router.push("/dashboard/data-upload?uploaded=true");
	};

	const onError = () => {
		toast({
			description: "Something went wrong, please try again",
			title: "Error",
			variant: "destructive",
		});
	};

	const { mutate: buyersUploadMutate, isPending: buyersUploadIsPending } = useBuyersUpload({ onError, onSuccess });
	const { mutate: usersUploadMutate, isPending: usersUploadIsPending } = useUsersUpload({ onError, onSuccess });
	const { mutate: ordersUploadMutate, isPending: ordersUploadIsPending } = useOrdersUpload({ onError, onSuccess });
	const { mutate: installmentsUploadMutate, isPending: installmentsUploadIsPending } = useInstallmentsUpload({
		onError,
		onSuccess,
	});

	const handleSubmit = () => {
		// if (data.crs)
		// 	buyersUploadMutate(
		// 		data.crs.map((cr: any) => ({
		// 			crName: cr["CR Name"],
		// 			crNumber: cr["CR Number"],
		// 			creditLimit: cr["Limit"],
		// 			repaymentPeriod: cr["Repayment Period"],
		// 			installmentNumber: cr["No of Installment"],
		// 			officePhone: cr["Office contact number"],
		// 			crAddress: cr["CR Address"],
		// 			isActive: cr["Status"] === "Active",
		// 		})),
		// 	);
		// if (data.users)
		// 	usersUploadMutate(
		// 		data.users.map((user: any) => ({
		// 			idNumber: user["ID"],
		// 			fullName: user["Full Name"],
		// 			email: user["Email"],
		// 			mobile: user["Mobile"],
		// 			crNumber: user["CR Number"],
		// 			idType: "nid",
		// 		})),
		// 	);
		// if (data.orders)
		// 	ordersUploadMutate(
		// 		data.orders.map((order: any) => ({
		// 			orderNumber: order["Order Number"],
		// 			orderDate: order["Placing Order date"],
		// 			orderAmount: order["Total order amount"],
		// 			deliveryDate: order["Delivery Date"],
		// 			installmentNumber: order["Total number of installments"],
		// 			installmentAmount: order["Installment amount"],
		// 			totalPaidAmount: order["Total paid amount"],
		// 			crNumber: order["CR Number"],
		// 			isActive: order["Status"] === "Active",
		// 		})),
		// 	);
		if (data.installments) installmentsUploadMutate(data.installments);
	};

	const isPending =
		buyersUploadIsPending || ordersUploadIsPending || installmentsUploadIsPending || usersUploadIsPending;

	if (!data || (!data.crs && !data.users && !data.orders && !data.installments)) {
		return (
			<div className="flex h-full w-full flex-col items-center justify-center gap-4">
				<span className="text-center font-bold">No data to review...</span>

				<Link
					className="flex items-center justify-center rounded-lg bg-[#242424] px-4 py-4 font-bold text-white hover:opacity-75 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
					href="/dashboard/data-upload"
				>
					<span>Upload data</span>
					<ArrowRightIcon />
				</Link>
			</div>
		);
	}

	const numberOfErrors = errors.flatMap(err => err.errors).length;

	return (
		<div className="flex h-full w-full gap-8 overflow-hidden p-4 pb-8">
			{!!data.crs && <CRTableValidation data={data.crs} setErrors={setErrors} />}
			{!!data.users && <UsersTableValidation data={data.users} setErrors={setErrors} />}
			{!!data.orders && <OrdersTableValidation data={data.orders} setErrors={setErrors} />}
			{!!data.installments && <InstallmentsTableValidation data={data.installments} />}

			<div className="flex max-h-full w-64 flex-col gap-4">
				<UploadConfirmation disabled={!!errors.length || isPending} onConfirm={handleSubmit} />

				{numberOfErrors ? (
					<>
						<div className="flex flex-col gap-2">
							<span className="text-center font-bold">Please re upload the new excel below again</span>

							{!!data.crs && (
								<UploadItem
									disabled={!!data.users || !!data.orders || !!data.installments || isPending}
									isValid={fileIsValid}
									name="CRs list"
									type="compact"
									validationFields={[
										"Status",
										"CR Address",
										"CR Name",
										"CR Number",
										"Limit",
										"No of Installment",
										"Office contact number",
										"Repayment Period",
									]}
									onDownloadTemplate={() => {}}
									onRemoveUpload={() => removeUpload("crs")}
									onUpload={data => handleUpload("crs", data)}
									onValidateFile={setFileIsValid}
								/>
							)}

							{!!data.users && (
								<UploadItem
									disabled={!!data.crs || !!data.orders || !!data.installments || isPending}
									isValid={fileIsValid}
									name="Users list"
									type="compact"
									validationFields={["CR Number", "Full Name", "ID", "Email", "Mobile", "Status"]}
									onDownloadTemplate={() => {}}
									onRemoveUpload={() => removeUpload("users")}
									onUpload={data => handleUpload("users", data)}
									onValidateFile={setFileIsValid}
								/>
							)}

							{!!data.orders && (
								<UploadItem
									disabled={!!data.crs || !!data.users || !!data.installments || isPending}
									isValid={fileIsValid}
									name="Orders list"
									type="compact"
									validationFields={[
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
									]}
									onDownloadTemplate={() => {}}
									onRemoveUpload={() => removeUpload("orders")}
									onUpload={data => handleUpload("orders", data)}
									onValidateFile={setFileIsValid}
								/>
							)}

							{!!data.installments && (
								<UploadItem
									disabled={!!data.crs || !!data.users || !!data.orders || isPending}
									isValid={fileIsValid}
									name="Collections"
									type="compact"
									validationFields={[
										"id",
										"reference",
										"merchant_reference",
										"merchant_name",
										"type",
										"status",
										"pending_review",
										"amount",
										"remaining_amount",
										"applied_amount",
										"sub_adjustments",
										"reason",
										"terminal_id",
										"year",
										"month",
										"eligible_at",
										"applied_at",
										"transferred_at",
										"creator",
										"created_at",
										"updated_at",
										"confirmed_at",
										"loan_id",
										"applied_on_payment_reference",
										"sub_account_payment_reference",
									]}
									onDownloadTemplate={() => {}}
									onRemoveUpload={() => removeUpload("installments")}
									onUpload={data => handleUpload("installments", data)}
									onValidateFile={setFileIsValid}
								/>
							)}
						</div>

						<div className="flex min-h-0 flex-1 flex-col gap-2">
							<span className="font-bold">errors - ({numberOfErrors})</span>

							<div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg bg-white p-4 shadow-md">
								{errors.flatMap(error =>
									error.errors.map((err, index) => (
										<button
											key={error.id + index}
											className={cn(
												"flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-gray-200 hover:opacity-75 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50",
												highlightedRow === error.id && "bg-gray-200",
											)}
											type="button"
											onClick={() => setParams({ highlightedRow: error.id })}
										>
											<span>{err.type}</span>
											<Icon className="w-6" name="Eye" />
										</button>
									)),
								)}
							</div>
						</div>
					</>
				) : (
					<div className="flex min-h-0 flex-1 flex-col gap-2">
						<span className="font-bold">errors - (0)</span>

						<div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg bg-white p-4 shadow-md">
							No errors in this list
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
