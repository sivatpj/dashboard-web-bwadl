import { useVirtualizer } from "@tanstack/react-virtual";
import dayjs from "dayjs";
import { useRef } from "react";
import { FormattedNumber } from "@/components/global/formatted-number";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type InstallmentsTableValidationProps = {
	data: any;
};

export const InstallmentsTableValidation = (props: InstallmentsTableValidationProps) => {
	const { data } = props;

	const tableHeaders = [
		{
			key: "id",
			type: "string",
		},
		{
			key: "reference",
			type: "string",
		},
		{
			key: "merchant_reference",
			type: "string",
		},
		{
			key: "merchant_name",
			type: "string",
		},
		{
			key: "type",
			type: "string",
		},
		{
			key: "status",
			type: "string",
		},
		{
			key: "pending_review",
			type: "boolean",
		},
		{
			key: "amount",
			type: "number",
		},
		{
			key: "remaining_amount",
			type: "number",
		},
		{
			key: "applied_amount",
			type: "number",
		},
		{
			key: "sub_adjustments",
			type: "array",
		},
		{
			key: "reason",
			type: "string",
		},
		{
			key: "terminal_id",
			type: "string",
		},
		{
			key: "year",
			type: "number",
		},
		{
			key: "month",
			type: "number",
		},
		{
			key: "eligible_at",
			type: "date",
		},
		{
			key: "applied_at",
			type: "date",
		},
		{
			key: "transferred_at",
			type: "date",
		},
		{
			key: "creator",
			type: "string",
		},
		{
			key: "created_at",
			type: "date",
		},
		{
			key: "updated_at",
			type: "date",
		},
		{
			key: "confirmed_at",
			type: "date",
		},
		{
			key: "loan_id",
			type: "string",
		},
		{
			key: "applied_on_payment_reference",
			type: "string",
		},
		{
			key: "sub_account_payment_reference",
			type: "string",
		},
	];
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: data.length,
		estimateSize: () => 97,
		getScrollElement: () => parentRef.current,
		overscan: 20,
	});

	const items = virtualizer.getVirtualItems();
	const padTop = items.length ? items[0].start : 0;
	const padBottom = virtualizer.getTotalSize() - (items.length ? items[items.length - 1].end : 0);

	return (
		<div className="w-1 flex-1">
			<div ref={parentRef} className="max-h-screen overflow-auto rounded-lg">
				<Table>
					<TableHeader className="sticky top-0 z-10 bg-[#D9D9D9]">
						<TableRow>
							{tableHeaders.map((header, i) => (
								<TableHead key={`th-${i}`} className="text-left font-bold text-[#141919]">
									{header.key}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>

					<TableBody className="bg-white">
						{/* top spacer */}
						<tr style={{ height: padTop }} />
						{/* visible rows */}
						{items.map(vr => {
							const item = data[vr.index];
							return (
								<TableRow key={item.id} style={{ height: vr.size }}>
									{tableHeaders.map((key, i) => (
										<TableCell key={`td-${i}-${item.id}`} className="font-light text-[#141919]" id={item.id}>
											{key.type === "number" ? (
												<FormattedNumber value={item[key.key]} />
											) : key.type === "date" ? (
												dayjs(item[key.key]).isValid() ? (
													dayjs(item[key.key]).format("YYYY-MM-DD")
												) : (
													""
												)
											) : key.type === "array" ? (
												Array.isArray(item[key.key]) ? (
													item[key.key].join(", ")
												) : (
													""
												)
											) : (
												item[key.key]
											)}
										</TableCell>
									))}
								</TableRow>
							);
						})}
						{/* bottom spacer */}
						<tr style={{ height: padBottom }} />
					</TableBody>
				</Table>
			</div>
		</div>
	);
};
