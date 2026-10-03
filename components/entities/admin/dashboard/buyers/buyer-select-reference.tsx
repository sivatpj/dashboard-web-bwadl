"use client";

import { useState } from "react";
import { useFetchCollectors } from "@/api/endpoints/back-office/collectors/fetch-collectors";
import { useFetchInsurers } from "@/api/endpoints/back-office/insurers/fetch-insurers";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
import { ICollector, IInsurer, IParticipantAccount, ISupplier } from "@/api/types";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationContext } from "@/contexts/translation";

interface SelectSupplierPopUpProps {
	trigger?: React.ReactNode;
	onSelect: (
		value: Partial<
			IParticipantAccount & {
				insurer?: IInsurer;
				collector?: ICollector;
				supplier?: ISupplier;
			}
		>[],
	) => void;
	values?: Array<
		IParticipantAccount & {
			insurer?: IInsurer;
			collector?: ICollector;
			supplier?: ISupplier;
		}
	>;

	disabled?: boolean;
}

export const SelectSupplierPopUp = (props: SelectSupplierPopUpProps) => {
	const { trigger, onSelect, values = [], disabled } = props;

	const { t } = useTranslationContext();

	const [open, setOpen] = useState(false);

	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [reference, setReference] = useState("");
	const [referenceType, setReferenceType] = useState<IParticipantAccount["participantType"]>("supplier");
	const [duplicateError, setDuplicateError] = useState(false);

	const suppliersQuery = useFetchSuppliers(undefined, {
		enabled: Boolean(referenceType === "supplier" && open),
	});
	const insurersQuery = useFetchInsurers(undefined, {
		enabled: Boolean(referenceType === "insurer" && open),
	});
	const collectorsQuery = useFetchCollectors(undefined, {
		enabled: Boolean(referenceType === "collector" && open),
	});

	return (
		<div className="flex w-full flex-col gap-1">
			<label className="text-sm text-[#404040]">{t("admin.buyers.reference")}</label>
			{!disabled && (
				<div className="flex items-end gap-2">
					<Input
						className="flex-1"
						disabled={disabled}
						placeholder={t("admin.buyers.enter-reference")}
						value={reference}
						onChange={e => setReference(e.target.value.replace(/\s+/g, ""))}
					/>

					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger disabled={!reference} asChild>
							{trigger || (
								<Button
									className="w-[200px] border border-black bg-white text-black hover:bg-white"
									disabled={!reference}
									type="button"
								>
									Select Reference
								</Button>
							)}
						</DialogTrigger>

						<DialogContent className="flex min-h-[460px] w-[580px] flex-col bg-[#F0F8FD] p-0">
							<div className="flex flex-1 flex-col justify-between rounded-[10px] bg-[#F0F8FD] px-10 py-8 shadow-lg">
								<div>
									<h2 className="mb-2 text-2xl font-bold">{t("admin.buyers.reference")}</h2>
									<p className="mb-4 text-muted-foreground">{t("admin.buyers.select-reference")}</p>

									<div className="mb-6">
										<Select
											value={referenceType}
											onValueChange={value => setReferenceType(value as IParticipantAccount["participantType"])}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select reference type (required)" />
											</SelectTrigger>

											<SelectContent>
												<SelectItem value="supplier">{t("admin.buyers.supplier")}</SelectItem>
												<SelectItem value="insurer">{t("admin.buyers.insurer")}</SelectItem>
												<SelectItem value="collector">{t("admin.buyers.collector")}</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{!referenceType && (
										<div className="rounded-md border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
											{t("admin.buyers.reference-required")}
										</div>
									)}

									{!!referenceType && (
										<>
											<div className="mt-4 w-full bg-[#F6F8FA] px-4 py-2 text-sm font-medium text-[#141919]">
												{referenceType === "supplier" && t("admin.suppliers.supplier-name")}
												{referenceType === "insurer" && t("admin.invoices.insurer")}
												{referenceType === "collector" && t("admin.invoices.collector")}
											</div>

											<div className="grid grid-cols-1 gap-y-0">
												{referenceType === "supplier" && (
													<>
														{suppliersQuery.data?.suppliers?.map(s => {
															const alreadyUsed = values.some(
																v => v.participantType === "supplier" && v.participantId === s.id,
															);
															return (
																<label
																	key={s.id}
																	className={`flex w-full items-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-medium text-[#404040] ${alreadyUsed ? "cursor-not-allowed opacity-50" : ""}`}
																>
																	<input
																		checked={selectedId === s.id}
																		disabled={alreadyUsed}
																		name="reference"
																		type="radio"
																		onChange={() => {
																			setSelectedId(s.id);
																			setDuplicateError(false);
																		}}
																	/>
																	{s.supplierName}
																	{alreadyUsed && <span className="ml-auto text-xs text-gray-400">Already selected</span>}
																</label>
															);
														})}
													</>
												)}

												{referenceType === "insurer" && (
													<>
														{insurersQuery.data?.insurers?.map(ins => {
															const alreadyUsed = values.some(
																v => v.participantType === "insurer" && v.participantId === ins.id,
															);
															return (
																<label
																	key={ins.id}
																	className={`flex w-full items-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-medium text-[#404040] ${alreadyUsed ? "cursor-not-allowed opacity-50" : ""}`}
																>
																	<input
																		checked={selectedId === ins.id}
																		disabled={alreadyUsed}
																		name="reference"
																		type="radio"
																		onChange={() => {
																			setSelectedId(ins.id);
																			setDuplicateError(false);
																		}}
																	/>
																	{ins.insurerName}
																	{alreadyUsed && <span className="ml-auto text-xs text-gray-400">Already selected</span>}
																</label>
															);
														})}
													</>
												)}

												{referenceType === "collector" && (
													<>
														{collectorsQuery.data?.collectors?.map(c => {
															const alreadyUsed = values.some(
																v => v.participantType === "collector" && v.participantId === c.id,
															);
															return (
																<label
																	key={c.id}
																	className={`flex w-full items-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-medium text-[#404040] ${alreadyUsed ? "cursor-not-allowed opacity-50" : ""}`}
																>
																	<input
																		checked={selectedId === c.id}
																		disabled={alreadyUsed}
																		name="reference"
																		type="radio"
																		onChange={() => {
																			setSelectedId(c.id);
																			setDuplicateError(false);
																		}}
																	/>
																	{c.collectorName}
																	{alreadyUsed && <span className="ml-auto text-xs text-gray-400">Already selected</span>}
																</label>
															);
														})}
													</>
												)}
											</div>
										</>
									)}
								</div>

								{duplicateError && (
									<p className="pt-4 text-sm text-red-500">
										This entity is already added as a reference. Please choose a different entity.
									</p>
								)}

								<div className="flex justify-end gap-4 pt-10">
									<DialogClose asChild>
										<Button className="flex-1" variant="outline">
											{t("admin.common.cancel")}
										</Button>
									</DialogClose>

									<Button
										className="flex-1"
										disabled={selectedId === null || !referenceType || !reference || duplicateError}
										onClick={() => {
											if (!selectedId || !reference || !referenceType) return;

											const isDuplicate = values.some(
												v => v.participantType === referenceType && v.participantId === selectedId,
											);
											if (isDuplicate) {
												setDuplicateError(true);
												return;
											}
											setDuplicateError(false);

											const insurer =
												referenceType === "insurer"
													? insurersQuery.data?.insurers.find(ins => ins.id === selectedId)
													: undefined;
											const collector =
												referenceType === "collector"
													? collectorsQuery.data?.collectors.find(col => col.id === selectedId)
													: undefined;
											const supplier =
												referenceType === "supplier"
													? suppliersQuery.data?.suppliers.find(sup => sup.id === selectedId)
													: undefined;

											onSelect([
												...values,
												{
													collector,
													insurer,
													participantBuyerReference: reference,
													participantId: selectedId,
													participantType: referenceType,
													supplier,
												},
											]);
											setOpen(false);
											setSelectedId(null);
											setReference("");
										}}
									>
										{t("admin.buyers.add-reference")}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			)}

			{values.length > 0 ? (
				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={values}
						headers={[
							{
								label: "References",
								render: (_, row) => {
									return row.insurer?.insurerName ?? row.collector?.collectorName ?? row.supplier?.supplierName ?? "-";
								},
							},
							{
								key: "participantBuyerReference",
								label: "Reference name",
							},
							{
								label: "",
								render: (_, row) =>
									disabled ? null : (
										<Button
											type="button"
											variant="ghost"
											onClick={() =>
												onSelect(
													values.filter(
														ref =>
															!(
																ref.participantId === row.participantId &&
																ref.participantBuyerReference === row.participantBuyerReference
															),
													),
												)
											}
										>
											<Icon className="h-4 w-4 fill-red-500" name="X" />
										</Button>
									),
							},
						]}
					/>
				</div>
			) : (
				disabled && <p className="text-sm text-muted-foreground">{t("admin.buyers.no-supplier-references")}</p>
			)}
		</div>
	);
};
