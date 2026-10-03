import dayjs from "dayjs";
import Link from "next/link";
import { Icon } from "@/components/global/icon";
import { Pagination } from "@/components/global/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { config } from "@/constants/config";

export const DataUploadTable = () => {
	const tableHeaders = ["Date", "Time", "Email", "Data type", "Number of entries", "Attachment"];

	const types = ["Users List", "CRs List", "Orders", "Installments"];
	const getRandomType = () => types[Math.floor(Math.random() * types.length)];
	const getRandomEmail = () => `user${Math.floor(Math.random() * 100)}@example.com`;
	const getRandomEntries = () => Math.floor(Math.random() * 4910) + 10;
	const getRandomAttachment = () => `file_${Math.floor(Math.random() * 1000)}.csv`;

	const data = Array.from({ length: 8 }, () => ({
		attachment: getRandomAttachment(),
		date: new Date().toISOString(),
		email: getRandomEmail(),
		entries: getRandomEntries(),
		id: Math.random().toString(36).substring(2, 15),
		type: getRandomType(),
	}));

	return (
		<div className="flex h-full flex-col gap-8 p-4 pb-8">
			<Link
				className="flex w-[200px] justify-between rounded-lg bg-[#242424] p-4 text-white hover:opacity-75 active:opacity-50"
				href={`${config.PATHS.dashboard.ADMIN.dataUpload}?stage=UPLOAD`}
			>
				Upload New
				<Icon className="h-6 w-6" name="UploadPlus" />
			</Link>

			<div className="flex-1">
				<Table className="overflow-hidden rounded-md">
					<TableHeader className="p bg-[#D9D9D9]">
						<TableRow>
							{tableHeaders.map((header, index) => (
								<TableHead key={`table-header-${index}`} className="text-left font-bold text-[#141919]">
									{header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>

					<TableBody className="bg-white">
						{data.map(item => (
							<TableRow key={item.id} className="h-12">
								{[
									dayjs(item.date).format("DD/MM/YYYY"),
									dayjs(item.date).format("HH:mm"),
									item.email,
									item.type,
									item.entries.toLocaleString(),
									<Icon key={`attachment-${item.id}`} className="h-4 w-4" name="Download" />,
								].map((value, index) => (
									<TableCell key={`table-cell-${index}-${item.id}`} className="text-left font-light text-[#141919]">
										{value}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Pagination />
		</div>
	);
};
