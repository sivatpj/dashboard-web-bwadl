"use client";

import { use } from "react";
import { useFetchInsurer } from "@/api/endpoints/back-office/insurers/fetch-insurer";
import { InsurerInformation } from "@/components/entities/admin/insurers/insurer-information";
import { DataLoading } from "@/components/global/data-loading";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";

export default function Page(props: PageProps<"/dashboard/insurers/[id]">) {
	const { id } = use(props.params);

	const { t } = useTranslationContext();

	const { data, isLoading } = useFetchInsurer({
		id,
	});

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.insurers.list-of-insurers"),
					},
					{
						position: 1,
						title: data?.insurer.insurerName,
					},
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={data?.insurer}>
				{insurer => (
					<div className="flex h-full flex-col gap-4 px-4 py-4">
						<InsurerInformation {...insurer} />
					</div>
				)}
			</DataLoading>
		</>
	);
}
