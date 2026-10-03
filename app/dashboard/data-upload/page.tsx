"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DataReviewTable } from "@/components/entities/admin/data-review-table";
import { DataUploadTable } from "@/components/entities/admin/data-upload-table";
import { UploadCards } from "@/components/entities/admin/upload-cards";

type Data = {
	crs?: any;
	users?: any;
	orders?: any;
	installments?: any;
};

export default function Page(props: PageProps<"/dashboard/data-upload">) {
	const params = useSearchParams();
	const stage = params.get("stage") || "UPLOAD";

	const [data, setData] = useState<{
		crs?: any;
		users?: any;
		orders?: any;
		installments?: any;
	}>({});

	const [fileIsValid, setFileIsValid] = useState<boolean>(true);

	const removeUpload = (type: keyof Data) => {
		setData(prev => ({ ...prev, [type]: null }));
		setFileIsValid(false);
	};
	const handleUpload = (type: keyof Data, data: any) => {
		setData(prev => ({ ...prev, [type]: data }));
	};

	useEffect(() => {
		if (!stage) {
			setData({
				crs: undefined,
				installments: undefined,
				orders: undefined,
				users: undefined,
			});
		}
	}, [stage]);

	// UPLOAD, CONFIRMATION, REVIEW, SUBMISSION
	return {
		"": <DataUploadTable />,
		REVIEW: (
			<DataReviewTable
				data={data}
				fileIsValid={fileIsValid}
				handleUpload={handleUpload}
				removeUpload={removeUpload}
				setFileIsValid={setFileIsValid}
			/>
		),
		UPLOAD: (
			<UploadCards
				data={data}
				fileIsValid={fileIsValid}
				handleUpload={handleUpload}
				removeUpload={removeUpload}
				setFileIsValid={setFileIsValid}
			/>
		),
	}[stage || ""];
}
