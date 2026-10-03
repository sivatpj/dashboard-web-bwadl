import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useInstallmentsDownload } from "@/api/endpoints/back-office/installments-download.api";
import { useSetParams } from "@/hooks/use-set-params";
import { UploadItem } from "./upload-item";

type Data = {
	crs?: any;
	users?: any;
	orders?: any;
	installments?: any;
};

type UploadCardsProps = {
	fileIsValid?: boolean;
	setFileIsValid?: (isValid: boolean) => void;
	data: Data;
	removeUpload: (type: keyof Data) => void;
	handleUpload: (type: keyof Data, data: any) => void;
};

export const UploadCards = (props: UploadCardsProps) => {
	const { data, handleUpload, removeUpload, fileIsValid, setFileIsValid } = props;

	const setParams = useSetParams();

	const { mutate: installmentsDownloadMutate, isPending: installmentsDownloadIsPending } = useInstallmentsDownload();

	return (
		<div className="flex h-full flex-col gap-6 p-4">
			<div className="flex justify-end gap-4">
				<Link
					className="rounded-lg border border-[#242424] p-2 px-6 font-bold text-[#242424] hover:opacity-75 active:opacity-50"
					href="/dashboard/data-upload"
				>
					Back
				</Link>

				<button
					className="flex items-center justify-between gap-24 rounded-lg bg-[#242424] px-4 py-2 font-bold text-white hover:opacity-75 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!fileIsValid}
					type="button"
					onClick={() => {
						setParams({ stage: "REVIEW" });
					}}
				>
					<span>Next</span>

					<ArrowRightIcon name="download" />
				</button>
			</div>
			<div className="flex flex-1 flex-col gap-4">
				{/*
				<UploadItem
					disabled={!!data.users || !!data.orders || !!data.installments}
					isValid={fileIsValid}
					name="CRs list"
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

				<UploadItem
					disabled={!!data.crs || !!data.orders || !!data.installments}
					isValid={fileIsValid}
					name="Users list"
					validationFields={["CR Number", "Full Name", "ID", "Email", "Mobile", "Status"]}
					onDownloadTemplate={() => {}}
					onRemoveUpload={() => removeUpload("users")}
					onUpload={data => handleUpload("users", data)}
					onValidateFile={setFileIsValid}
				/>

				<UploadItem
					disabled={!!data.crs || !!data.users || !!data.installments}
					isValid={fileIsValid}
					name="Orders list"
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
				/> */}

				<UploadItem
					disabled={!!data.crs || !!data.users || !!data.orders || installmentsDownloadIsPending}
					isValid={fileIsValid}
					name="Collections"
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
					onDownloadTemplate={installmentsDownloadMutate}
					onRemoveUpload={() => removeUpload("installments")}
					onUpload={data => handleUpload("installments", data)}
					onValidateFile={setFileIsValid}
				/>
			</div>
		</div>
	);
};
