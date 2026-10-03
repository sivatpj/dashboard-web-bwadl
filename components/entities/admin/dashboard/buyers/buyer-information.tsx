import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Mail, Phone, UtensilsCrossed } from "lucide-react";
import { IBuyer, IParticipantAccount } from "@/api/types";
import { AddBuyerPayment } from "@/components/entities/admin/dashboard/buyers/add-buyer-level-payment";
import { AddNewSalesOrder } from "@/components/entities/admin/dashboard/invoices/add-new-salesorder";
import { DetailCard } from "@/components/global/detail-card";
import { Icon } from "@/components/global/icon";
import { useTranslationContext } from "@/contexts/translation";
import { formatCurrency } from "@/lib/format-currency";

dayjs.extend(relativeTime);

interface BuyerInformationProps extends IBuyer {
	participantBuyerReferences: IParticipantAccount[];
}

const formatBuyerCategory = (value?: string) => {
	if (!value) return "-";
	return value
		.split(/[_\s-]+/)
		.filter(Boolean)
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
};

export const BuyerInformation = (props: BuyerInformationProps) => {
	const {
		id,
		crNumber,
		facilityName,
		buyerName,
		creditLimit,
		createdAt,
		isCurrent,
		additionalInfo,
		contactNumber,
		emailAddress: emailAddressProp,
		buyerCategory: buyerCategoryProp,
	} = props;

	const { t } = useTranslationContext();

	const buyerInitial = buyerName?.trim()?.charAt(0) || "B";
	const joinedText = createdAt ? dayjs(createdAt).format("MMM YYYY") : "-";
	/* const lastSalesOrderText = additionalInfo?.lastInvoiceAt ? dayjs(additionalInfo.lastInvoiceAt).fromNow() : "-";  */
	const buyerCategory = formatBuyerCategory(buyerCategoryProp || additionalInfo?.buyerCategory);
	const rawContactNumber =
		contactNumber || additionalInfo?.phone || additionalInfo?.mobileNumber || additionalInfo?.contactNumber;
	const contactNumberText = rawContactNumber
		? rawContactNumber.startsWith("+966")
			? rawContactNumber
			: `+966 ${rawContactNumber}`
		: "-";
	const emailAddress = emailAddressProp || additionalInfo?.email || "-";

	return (
		<div className="rounded-[12px] bg-[#EAF4FB] px-6 py-5">
			<div className="flex flex-col gap-6">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-5">
						<div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-full bg-[#404040] text-[32px] font-bold text-white">
							{buyerInitial}
						</div>

						<div className="flex flex-col gap-3">
							<div className="flex flex-wrap items-center gap-3">
								<h2 className="text-[24px] font-bold leading-none text-[#404040]">{buyerName || "-"}</h2>

								<span className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-1 text-[16px] font-semibold text-[#21A519]">
									<span className={`h-2.5 w-2.5 rounded-full ${isCurrent ? "bg-[#21A519]" : "bg-[#9CA3AF]"}`} />
									{isCurrent ? t("admin.buyers.active") : t("admin.buyers.inactive")}
								</span>

								<span className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-1 text-[16px] text-[#4A4A4A]">
									<span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#FF1E1E] text-white">
										<UtensilsCrossed className="h-3.5 w-3.5" />
									</span>
									{buyerCategory}
								</span>

								<div className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-2 text-[14px] text-[#5A5A5A]">
									<Phone className="h-4 w-4 text-[#404040]" />
									<span>{contactNumberText}</span>
								</div>

								<div className="inline-flex items-center gap-2 rounded-[6px] bg-white px-3 py-2 text-[14px] text-[#5A5A5A]">
									<Mail className="h-4 w-4 text-[#404040]" />
									<span>{emailAddress}</span>
								</div>
							</div>

						<div className="flex flex-wrap items-center gap-2 text-[16px] text-[#4A4A4A]">
								<span>
									{t("admin.buyers.joined")} <span className="font-bold">{joinedText}</span>
								</span>
								{/* <span className="text-[#808080]">•</span>
								<span>
									{t("admin.buyers.last-sales-order")} <span className="font-bold">{lastSalesOrderText}</span>
								</span> */}
							</div> 
						</div>
					</div>

					<div className="flex items-start gap-3">
						<AddBuyerPayment buyer={props} />
						<AddNewSalesOrder buyerId={id} />
					</div>
				</div>

				<div className="flex justify-between gap-8">
					<DetailCard label={t("admin.buyers.buyer-id")} value={String(id || "-")} />
					<DetailCard label={t("admin.buyers.cr-number")} value={String(crNumber || "-")} />
					<DetailCard label={t("admin.buyers.buyer-name")} value={buyerName || "-"} />
					<DetailCard label={t("admin.buyers.facility-name")} value={facilityName || "-"} />
					{/* <DetailCard
						label={t("admin.buyers.credit-limit")}
						value={
							<span className="inline-flex items-center gap-2">
								<Icon className="h-5 w-5" name="Riyal" />
								<span>{formatCurrency(creditLimit, true) || "0.00"}</span>
							</span>
						}
					/> */}
				</div>
			</div>
		</div>
	);
};
