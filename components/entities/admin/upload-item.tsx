import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as xlsx from "xlsx";
import { Icon } from "@/components/global/icon";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UploadItemProps = {
	name: string;
	onDownloadTemplate: () => void;
	onUpload: (data: any) => void;
	onRemoveUpload: () => void;
	validationFields: string[];
	isValid?: boolean;
	onValidateFile?: (isValid: boolean) => void;
	disabled?: boolean;
	type?: "default" | "compact";
};

export const UploadItem = (props: UploadItemProps) => {
	const {
		type = "default",
		isValid,
		onValidateFile,
		name,
		onDownloadTemplate,
		onUpload,
		onRemoveUpload,
		validationFields,
		disabled,
	} = props;

	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			onValidateFile?.(true);
			setUploading(true);
			if (acceptedFiles.length) {
				setFile(acceptedFiles[0]);

				const reader = new FileReader();
				reader.onload = e => {
					const data = e.target?.result;
					if (!data) return;

					const workbook = xlsx.read(data, { cellDates: true, type: "array" });
					const sheetName = workbook.SheetNames[0];
					const worksheet = workbook.Sheets[sheetName];
					const headers = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0] as any;

					const missingFields = validationFields.filter(field => !headers.includes(field));

					const isValid = missingFields.length === 0;
					onValidateFile?.(isValid);

					if (!isValid) return;

					const jsonData = xlsx.utils.sheet_to_json(worksheet);

					onUpload?.(jsonData);
				};

				reader.readAsArrayBuffer(acceptedFiles[0]);
			}
			setUploading(false);
		},
		[onUpload],
	);

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
			"text/csv": [".csv"],
		},
		disabled,
		onDrop,
	});

	if (type === "compact")
		return (
			<div className="flex-1">
				<div
					{...getRootProps({
						className: cn(
							"h-full rounded-lg border border-input border-dashed bg-white shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
							disabled ? "cursor-not-allowed opacity-50" : "hover:border-black hover:border-solid",
							!isValid && "border-red-500 border-solid",
						),
					})}
				>
					<input {...getInputProps({ disabled })} />

					<div className="flex h-full flex-col items-center justify-between gap-4 px-4 py-2">
						<Icon className="w-8 text-sm text-[#A6A6A6]" name="Upload" />

						<span className="text-center text-sm text-black">Choose a file or drag & drop it here</span>

						{!isValid && !uploading && <span className="text-center text-sm text-red-400">Invalid file uploaded</span>}

						<span className="rounded-lg border border-[#C9CFD6] px-6 text-center text-[#848B93]">Browse file</span>
					</div>
				</div>
			</div>
		);

	return (
		<Card className="flex flex-1 gap-4 p-4">
			<div className="flex flex-1 flex-col justify-between gap-4">
				<span className="text-xl font-bold">Upload {name}</span>

				{/* <button
					className="w-full rounded-lg bg-[#242424] px-4 py-2 font-bold text-white hover:opacity-75 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={disabled}
					type="button"
					onClick={onDownloadTemplate}
				>
					Download Data
				</button> */}
			</div>

			<hr className="h-full w-[1px] bg-[#C9CFD6]" />

			<div className="flex-1">
				<div
					{...getRootProps({
						className: cn(
							"h-full  rounded-lg border border-input border-dashed bg-white shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
							disabled ? "cursor-not-allowed opacity-50" : "hover:border-black hover:border-solid",
						),
					})}
				>
					<input {...getInputProps({ disabled })} />

					<div className="flex h-full flex-col items-center justify-between gap-2 px-4 py-2">
						<Icon className="w-8 text-sm text-[#A6A6A6]" name="Upload" />

						<span className="text-sm text-black">Choose and Excel file or drag & drop it here</span>

						<span className="rounded-lg border border-[#C9CFD6] px-6 text-center text-[#848B93]">Browse file</span>
					</div>
				</div>
			</div>

			<hr className="h-full w-[1px] bg-[#C9CFD6]" />

			<div className="flex-1">
				{file && (
					<div className="flex h-full w-full gap-8 rounded-lg bg-[#E0E5EB] p-4">
						<Icon className="w-8" name="File" />

						<div className="flex flex-1 flex-col justify-center gap-2">
							<span className={cn("truncate text-sm", isValid ? "text-black" : "text-red-500")}>{file.name}</span>
							<div className={cn("h-4 rounded-md", isValid ? "bg-black" : "bg-red-500")} />
							{!isValid && (
								<span className="text-xs text-[#848B93]">File is invalid. Please upload the correct template.</span>
							)}
						</div>

						{isValid ? (
							<Icon className="w-8" name="Tick" />
						) : (
							<button
								type="button"
								onClick={() => {
									onRemoveUpload();
									setFile(null);
								}}
							>
								<Icon className="w-8" name="XRed" />
							</button>
						)}
					</div>
				)}
			</div>
		</Card>
	);
};
