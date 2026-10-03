"use client";

import { use } from "react";
import { useFetchFinancier } from "@/api/endpoints/back-office/financiers/fetch-financier";
import { FinancierEditForm } from "@/components/entities/admin/dashboard/financiers/financier-edit-form";
import { DataLoading } from "@/components/global/data-loading";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";

export default function Page(props: PageProps<"/dashboard/financiers/[id]/edit">) {
	const { id } = use(props.params);
	const { t } = useTranslationContext();

	const { data, isLoading } = useFetchFinancier({ id });

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{ position: 0, title: t("admin.financiers.list-of-financiers") },
					{ position: 1, title: data?.financier?.financierName },
					{ position: 2, title: t("admin.common.edit") },
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={data?.financier}>
				{financier => (
					<div className="flex flex-col gap-4 p-4">
						<FinancierEditForm {...financier} />
					</div>
				)}
			</DataLoading>
		</>
	);
}
