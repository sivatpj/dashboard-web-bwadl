"use client";

import { use } from "react";
import { useFetchBuyer } from "@/api/endpoints/back-office/buyers/fetch-buyer";
import { BuyerInformation } from "@/components/entities/admin/dashboard/buyers";
import { BuyerTabs } from "@/components/entities/admin/dashboard/buyers/buyer-tabs";
import { DataLoading } from "@/components/global/data-loading";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";

export default function Page(props: PageProps<"/dashboard/buyers/[id]">) {
	const { id } = use(props.params);

	const { t } = useTranslationContext();

	const { data, isLoading } = useFetchBuyer({
		id,
	});

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.buyer.list-of-buyers"),
					},
					{
						position: 1,
						title: data?.buyer?.buyerName,
					},
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={data?.buyer}>
				{buyer => (
					<div className="flex flex-col gap-4 p-4">
						<BuyerInformation {...buyer} />
						<BuyerTabs buyer={buyer} />
					</div>
				)}
			</DataLoading>
		</>
	);
}
