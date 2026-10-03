import { Button } from "@/components/ui/button";
import { UploadInput } from "@/components/ui/upload-input";

interface DocumentsStepProps {
	onComplete: () => void;
	type: "COMPANY" | "INDIVIDUAL" | "ADD_CR";
}

export const DocumentsStep = (props: DocumentsStepProps) => {
	const { onComplete, type } = props;

	return (
		<div className="flex flex-1 flex-col justify-between gap-2">
			<div className="flex flex-1 flex-col gap-6">
				{type === "ADD_CR" && <UploadInput label="CR Certificate" name="cr-certificate" type="upload" multiple />}

				{type === "COMPANY" && <UploadInput label="Owners IDs" name="owners-ids" type="upload" multiple />}

				<UploadInput label="Article of Associations" name="document-article-of-associations" type="upload" />

				<UploadInput label="Bylaws" name="document-bylaws" type="upload" />

				<UploadInput label="Bank Statement" name="document-statements" type="upload" />

				<UploadInput label="Other Documents" name="document-other-documents" type="upload" multiple />
			</div>

			<div className="flex gap-8">
				<Button className="flex-1" onClick={onComplete}>
					Next
				</Button>

				<Button className="flex-1" variant="outline" onClick={onComplete}>
					Skip
				</Button>
			</div>
		</div>
	);
};
