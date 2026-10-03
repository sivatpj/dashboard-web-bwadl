"use client";

import { use } from "react";
import { useFetchBuyer } from "@/api/endpoints/back-office/buyers/fetch-buyer";
import { BuyerEditForm } from "@/components/entities/admin/dashboard/buyers/buyer-edit-form";
import { DataLoading } from "@/components/global/data-loading";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";

export default function Page(props: PageProps<"/dashboard/buyers/[id]/edit">) {
	const { id } = use(props.params);

	const { t } = useTranslationContext();

	const { data, isLoading } = useFetchBuyer({ id });

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
					{
						position: 2,
						title: t("admin.common.edit"),
					},
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={data?.buyer}>
				{buyer => (
					<div className="flex flex-col gap-4 p-4">
						<BuyerEditForm {...buyer} participantBuyerReferences={buyer.participantBuyerReferences ?? []} />
					</div>
				)}
			</DataLoading>
		</>
	);
}
