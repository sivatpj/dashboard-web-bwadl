"use client";

import { format } from "date-fns";
import dayjs from "dayjs";
import { useState } from "react";
import { Icon } from "@/components/global/icon";
import { AmountInput } from "@/components/ui/amount-input";
import { AutoCompleteInput } from "@/components/ui/autocomplete-input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface BuyerInvoiceAddPopUpProps {
	trigger?: React.ReactNode;
	amount?: number;
	number?: string;
	date?: string;
	id?: number;
}

export const BuyerInvoiceAddPopUp = (props: BuyerInvoiceAddPopUpProps) => {
	const { trigger, amount, number, date, id } = props;

	const [invoice, setInvoice] = useState({
		amount,
		date: "",
		number,
	});
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(dayjs(date).toDate());
	const [searchValue, setSearchValue] = useState("");

	const mockInvoiceNumbers = [number, "FS00007923", "FS00007936", "FS00007938", "FS00007941", "FS00007937"].filter(
		num => num !== undefined && num !== null,
	);

	const handleChange = (field: string, value: string) => {
		setInvoice(prev => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				{trigger || (
					<Button className="w-[200px] border border-black bg-white text-black hover:bg-white" type="button">
						Skip
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="flex flex-1 flex-col bg-[#F0F8FD] p-0">
				<div className="flex flex-col">
					<div className="relative flex flex-1 flex-col rounded-[10px] bg-[#F0F8FD] px-10 py-8 shadow-lg">
						<h2 className="mb-2 text-2xl font-bold">Add new Invoice</h2>
						<p className="mb-10 text-muted-foreground">Please fill the following form to add new Invoice</p>

						<div className="grid grid-cols-2 gap-x-10 gap-y-6">
							<div>
								<label className="text-sm font-medium text-[#404040]">Invoice Number</label>

								<AutoCompleteInput
									isLoading={false}
									items={mockInvoiceNumbers.map(num => ({
										label: num,
										value: num,
									}))}
									placeholder={"Select Invoice Number"}
									searchValue={searchValue}
									selectedValue={invoice.number || ""}
									onSearchValueChange={setSearchValue}
									onSelectedValueChange={value => handleChange("number", value)}
								/>
							</div>
							<div />

							<div>
								<label className="text-sm font-medium text-[#404040]">Invoice Amount</label>
								<AmountInput
									className="mt-1 w-full"
									min={0}
									placeholder="Invoice Amount"
									value={invoice.amount}
									onChange={value => handleChange("amount", String(value))}
								/>
							</div>

							<div>
								<label className="text-sm font-medium text-[#404040]">Invoice Date</label>
								<Popover>
									<PopoverTrigger asChild>
										<div className="relative">
											<Input
												className="mt-1 w-full cursor-pointer pr-10"
												icon={<Icon name="Calendar" />}
												iconPosition="right"
												placeholder="Invoice Date"
												value={selectedDate ? format(selectedDate, "PPP") : ""}
												readOnly
											/>
										</div>
									</PopoverTrigger>

									<PopoverContent align="end" className="w-auto p-0">
										<Calendar
											mode="single"
											selected={selectedDate}
											initialFocus
											onSelect={date => {
												setSelectedDate(date);
												handleChange("date", date ? format(date, "yyyy-MM-dd") : "");
											}}
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>

						<div className="mt-10 flex justify-end gap-4">
							<DialogClose asChild>
								<Button className="w-[225px] border border-black bg-[#969696] text-[#000000] hover:bg-[#969696]">
									Cancel
								</Button>
							</DialogClose>
							<DialogClose asChild>
								<Button className="w-[225px]">Add Invoice</Button>
							</DialogClose>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
