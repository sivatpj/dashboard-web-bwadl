import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Icon } from "../global/icon";
import { InputError } from "./input-error";

interface UploadInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
	error?: string;
	value?: File[] | File | undefined;
	onChange?: React.Dispatch<React.SetStateAction<File[] | File | null>>;
	label?: string;
}

export const UploadInput = React.forwardRef<HTMLInputElement, UploadInputProps>((props, ref) => {
	const { label, value, onChange, required, className, error, disabled, name, multiple = false } = props;

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles.length) {
				if (multiple) {
					onChange?.(acceptedFiles);
				} else {
					onChange?.(acceptedFiles[0]);
				}
			}
		},
		[multiple, onChange],
	);

	const removeFile = (fileToRemove: File) => {
		if (multiple && Array.isArray(value)) {
			onChange?.(value.filter(file => file !== fileToRemove));
		} else {
			onChange?.(null);
		}
	};

	const { getRootProps, getInputProps } = useDropzone({ multiple, onDrop });

	return (
		<div className={cn("relative flex flex-1 flex-col gap-1", className)}>
			{label && (
				<label className="absolute -top-5 text-sm font-bold text-[#595959]" htmlFor={name}>
					{label}
				</label>
			)}

			<div
				{...getRootProps({
					className: cn(
						"h-12 rounded-md border border-input border-dashed bg-white shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
						{ "border-red-300": !!error },
					),
				})}
			>
				<input ref={ref} {...getInputProps({ disabled, multiple, name, required })} />

				{value ? (
					<div className="flex h-full items-center justify-between px-3">
						<span className="text-sm text-[#A6A6A6]">
							{Array.isArray(value) ? `${value.length} files` : value.name}
						</span>

						{(Array.isArray(value) ? value : [value]).map((file, index) => (
							<div key={index}>
								<button className="text-sm text-red-500 hover:underline" type="button" onClick={() => removeFile(file)}>
									X
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="flex h-full items-center justify-between px-3">
						<span className="text-sm text-[#A6A6A6]">
							Drag & drop or <strong className="text-black">choose file</strong> to upload
						</span>

						<Icon className="text-sm text-[#A6A6A6]" name="Upload" />
					</div>
				)}
			</div>

			<InputError>{error}</InputError>
		</div>
	);
});
