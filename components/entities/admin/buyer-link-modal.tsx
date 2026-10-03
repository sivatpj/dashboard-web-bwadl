"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const mockMerchants = [
	{ name: "Riyadh Hypermarket", outstanding: "3,200 SAR", reference: "RH001", supplier: "Gulf Supplies Co." },
	{ name: "Al Nakheel Traders", outstanding: "1,050 SAR", reference: "AN023", supplier: "Elite Merchants" },
	{ name: "Kingdom Mart", outstanding: "0 SAR", reference: "KM334", supplier: "Arabian Wholesalers" },
	{ name: "Riyadh Tech Depot", outstanding: "4,700 SAR", reference: "RT998", supplier: "Digital Hub Ltd." },
	{ name: "Capital Electronics", outstanding: "2,600 SAR", reference: "CE456", supplier: "PowerLines KSA" },
];

interface BuyerLinkModalProps {
	selectedRefs: string[];
	setSelectedRefs: (refs: string[]) => void;
}

export const BuyerLinkModal = (props: BuyerLinkModalProps) => {
	const { selectedRefs, setSelectedRefs } = props;

	const [search, setSearch] = useState("");

	const filtered = mockMerchants.filter(merchant => merchant.name.toLowerCase().includes(search.toLowerCase()));

	const toggle = (ref: string) => {
		if (selectedRefs.includes(ref)) {
			setSelectedRefs(selectedRefs.filter(r => r !== ref));
		} else {
			setSelectedRefs([...selectedRefs, ref]);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="w-full" type="button">
					Assign Buyer
				</Button>
			</DialogTrigger>

			<DialogContent className="flex flex-1 flex-col bg-[#F0F8FD] p-0">
				<div className="flex items-center justify-center">
					<div className="relative h-[600px] w-[1200px] rounded-[10px] bg-[#F0F8FD] px-8 py-6 shadow-lg">
						<div className="flex items-center justify-between">
							<h2 className="text-2xl font-bold">Link buyer with External code</h2>
						</div>

						<div className="mb-6 mt-1 flex items-center justify-between">
							<p className="text-muted-foreground">Please select entities below to link it with the buyer</p>
							<div className="flex gap-2">
								<DialogClose asChild>
									<Button className="w-[300px]" disabled={selectedRefs.length === 0}>
										Next
									</Button>
								</DialogClose>
							</div>
						</div>

						<div className="relative mt-6">
							<input
								className="w-full rounded-md border border-input bg-background px-4 py-2 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground"
								placeholder="Search here..."
								value={search}
								onChange={e => setSearch(e.target.value)}
							/>
							<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
								<Icon name="Search" />
							</span>
						</div>

						{selectedRefs.length > 0 && (
							<div className="mt-4 flex flex-wrap gap-2">
								{selectedRefs.map(ref => (
									<div key={ref} className="flex items-center gap-2 rounded bg-[#D9D9D9] px-3 py-1 text-sm text-black">
										{ref}
										<button className="ml-1 text-black" type="button" onClick={() => toggle(ref)}>
											<X className="h-4 w-4" />
										</button>
									</div>
								))}
							</div>
						)}

						<div className="mt-6 overflow-y-auto rounded-md border">
							<table className="min-w-full text-sm">
								<thead className="bg-[#D9D9D9] text-left font-semibold text-[#242424]">
									<tr>
										<th className="px-4 py-3">Merchant Name</th>
										<th className="px-4 py-3">Merchant Reference</th>
										<th className="px-4 py-3">Supplier</th>
										<th className="px-4 py-3">Pending Outstanding</th>
									</tr>
								</thead>
								<tbody>
									{filtered.map(merchant => {
										const isSelected = selectedRefs.includes(merchant.reference);
										const cleanedOutstanding = merchant.outstanding.replace(" SAR", "");

										return (
											<tr
												key={merchant.reference}
												className={`cursor-pointer border-b border-[#D9D9D9] ${isSelected ? "bg-[#F3F3F3]" : ""}`}
												onClick={() => toggle(merchant.reference)}
											>
												<td className="px-4 py-3">
													<div className="relative flex items-center gap-2">
														<input
															checked={isSelected}
															className="h-[20px] w-[20px] appearance-none rounded-sm border border-black bg-white checked:bg-black"
															type="checkbox"
															onChange={() => toggle(merchant.reference)}
															onClick={e => e.stopPropagation()}
														/>
														{isSelected && (
															<svg
																className="absolute left-0 top-0 ml-[2px] mt-[2px]"
																fill="none"
																height="16"
																viewBox="0 0 16 16"
																width="16"
																xmlns="http://www.w3.org/2000/svg"
															>
																<path
																	d="M12.207 4.207a1 1 0 0 0-1.414-1.414L6 7.586 4.207 5.793a1 1 0 1 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l5.5-5.5z"
																	fill="white"
																/>
															</svg>
														)}
														{merchant.name}
													</div>
												</td>
												<td className="px-4 py-3">{merchant.reference}</td>
												<td className="px-4 py-3">{merchant.supplier}</td>
												<td className="px-4 py-3">{cleanedOutstanding}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
