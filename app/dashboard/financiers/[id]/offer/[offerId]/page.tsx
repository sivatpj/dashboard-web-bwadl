"use client";

import { use } from "react";
import { useFetchFinancier } from "@/api/endpoints/back-office/financiers/fetch-financier";
import { OfferInformation } from "@/components/entities/admin/financiers/offer-information";
import { DataLoading } from "@/components/global/data-loading";
import { Icon } from "@/components/global/icon";
import { Input } from "@/components/ui/input";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";

export default function Page(props: PageProps<"/dashboard/financiers/[id]/offer/[offerId]">) {
	const { id, offerId } = use(props.params);

	const { t } = useTranslationContext();

	const { data, isLoading } = useFetchFinancier({ id });

	const offer = data?.financier.financierSupplierContracts
		.flatMap(contract => contract.financierOffers)
		.find(o => o.id === +offerId);

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						href: config.PATHS.dashboard.ADMIN.financiers,
						position: 0,
						title: t("admin.financiers.list-of-financiers"),
					},
					{
						href: config.PATHS.dashboard.ADMIN.financier(+id),
						position: 1,
						title: data?.financier.financierName,
					},
					{ position: 2, title: offer?.offerName },
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={offer}>
				{offer => (
					<div className="flex h-full flex-col gap-4 px-4 py-4">
						<Input
							className="h-[60px] w-[870px] font-bold"
							icon={<Icon className="h-4 w-4" name="Search" />}
							iconPosition="right"
							placeholder={t("admin.buyer.search-here-placeholder")}
							type="text"
						/>

						<OfferInformation financierId={+id} offer={offer} />
					</div>
				)}
			</DataLoading>
		</>
	);
}
