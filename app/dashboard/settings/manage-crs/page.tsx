"use client";

import { useState } from "react";
import { DocumentsCR } from "@/components/settings/team-access/manage-cr/documents-cr";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Page(props: PageProps<"/dashboard/settings/manage-crs">) {
	const initialCRData = [
		{
			articles: "Updated",
			bankStatement: "Updated",
			bylaws: "Updated",
			crCertificate: "Updated",
			creditLimit: "22,500 SAR",
			crn: "1010123456",
			idCopy: "Updated",
			name: "Al Tazaj",
			status: "Pending approval",
		},
		{
			articles: "Updated",
			bankStatement: "Updated",
			bylaws: "Updated",
			crCertificate: "Expired",
			creditLimit: "22,500 SAR",
			crn: "2050554321",
			idCopy: "Updated",
			name: "Shawarma X",
			status: "Approved",
		},
		{
			articles: "Updated",
			bankStatement: "Updated",
			bylaws: "Updated",
			crCertificate: "Updated",
			creditLimit: "22,500 SAR",
			crn: "4030228789",
			idCopy: "Updated",
			name: "Broasted BC",
			status: "Approved",
		},
	];

	const [crData, setCrData] = useState(initialCRData);
	const [open, setOpen] = useState(false);
	const [secondOpen, setSecondOpen] = useState(false);
	const [crNumber, setCrNumber] = useState("");

	return (
		<div className="p-6">
			<div className="border-collapse overflow-hidden rounded-lg border bg-white shadow-md">
				<div className="p-4">
					<div className="overflow-hidden rounded-lg border">
						<table className="w-full border-collapse text-sm">
							<thead>
								<tr className="text-s bg-gray-100 text-left font-semibold text-gray-700">
									{[
										"CRN",
										"CR Name",
										"Credit Limit",
										"ID Copy",
										"CR Certificate",
										"Articles of Associations",
										"Bylaws",
										"Bank Statement",
										"CR Status",
									].map((header, index) => (
										<th key={index} className="whitespace-nowrap border-b border-gray-300 px-4 py-3">
											{header}
										</th>
									))}
								</tr>
							</thead>

							<tbody>
								{crData.map((cr, index) => (
									<tr key={index} className="border-b last:border-none">
										{Object.values(cr).map((value, valueIndex) => (
											<td
												key={valueIndex}
												className={`px-4 py-3 ${
													(valueIndex === 4 && value === "Expired") ||
													(valueIndex === 8 && value === "Pending approval")
														? "font-bold text-red-500"
														: "text-gray-700"
												}`}
											>
												{value}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<div className="flex justify-end p-4">
					<Button className="w-[25%] rounded-md bg-black px-8 py-3 text-white" onClick={() => setOpen(true)}>
						Add new CR
					</Button>
				</div>
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="h-[50%] w-[35%] rounded-xl bg-[#eff8ff] p-6">
					<div>
						<DialogHeader>
							<DialogTitle className="text-2xl font-bold">Add new CR</DialogTitle>

							<DialogDescription className="text-base text-gray-600">Please enter CR number</DialogDescription>
						</DialogHeader>

						<div className="space-y-2 pt-8">
							<label className="text-sm font-semibold text-gray-700">CR Number</label>

							<Input
								className="w-full"
								placeholder="CR Number"
								value={crNumber}
								onChange={e => setCrNumber(e.target.value)}
							/>
						</div>
					</div>

					<div className="mt-12 flex justify-center pt-12">
						<Button
							className="w-[50%] bg-black text-white"
							onClick={() => {
								setOpen(false);
								setSecondOpen(true);
							}}
						>
							Next
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={secondOpen} onOpenChange={setSecondOpen}>
				<DialogContent className="h-[75%] w-[35%] rounded-xl bg-[#eff8ff] p-6">
					<DialogHeader className="text-center">
						<DialogTitle className="text-2xl font-bold">Documentations</DialogTitle>

						<DialogDescription className="text-base text-gray-600">
							Please attach a copy of the following documents
						</DialogDescription>
					</DialogHeader>

					<DocumentsCR
						type="MANAGE_CR"
						onComplete={() => {
							setSecondOpen(false);
						}}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
