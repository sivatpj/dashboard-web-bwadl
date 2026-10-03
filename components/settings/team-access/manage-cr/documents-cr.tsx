import { Button } from "@/components/ui/button";
import { UploadInput } from "@/components/ui/upload-input";

interface DocumentsCRProps {
	onComplete: () => void;
	type: "COMPANY" | "INDIVIDUAL" | "ADD_CR" | "MANAGE_CR";
}

export const DocumentsCR = (props: DocumentsCRProps) => {
	const { onComplete, type } = props;

	return (
		<div className="flex flex-1 flex-col justify-between gap-2 bg-[#eff8ff] p-1">
			<div className="flex flex-1 flex-col gap-6">
				<UploadInput label="Copy of your ID" name="copy-of-id" type="upload" />

				{(type === "ADD_CR" || type === "MANAGE_CR") && (
					<UploadInput label="CR Certificate" name="cr-certificate" type="upload" />
				)}

				<UploadInput label="Articles of associations" name="articles-of-associations" type="upload" />

				<UploadInput label="Bylaws" name="bylaws" type="upload" />

				<UploadInput label="Bank statement" name="statements" type="upload" />
			</div>

			<div className="flex items-center justify-center pt-8">
				<div className="flex w-[70%] gap-4">
					<Button
						className="flex-1 border border-gray-300 bg-white text-black hover:bg-gray-100"
						variant="outline"
						onClick={onComplete}
					>
						Skip
					</Button>

					<Button className="flex-1 bg-black text-white hover:bg-gray-900" onClick={onComplete}>
						Save
					</Button>
				</div>
			</div>
		</div>
	);
};
