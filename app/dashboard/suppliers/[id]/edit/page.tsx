"use client";

import { use } from "react";
import { useFetchSupplier } from "@/api/endpoints/back-office/suppliers/fetch-supplier";
import { SupplierEditForm } from "@/components/entities/admin/dashboard/suppliers/supplier-edit-form";
import { DataLoading } from "@/components/global/data-loading";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";

export default function Page(props: PageProps<"/dashboard/suppliers/[id]/edit">) {
	const { id } = use(props.params);
	const { t } = useTranslationContext();

	const { data, isLoading } = useFetchSupplier({ id });

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.suppliers.list-of-suppliers"),
					},
					{
						position: 1,
						title: data?.supplier?.supplierName,
					},
					{
						position: 2,
						title: t("admin.common.edit"),
					},
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={data?.supplier}>
				{supplier => (
					<div className="flex flex-col gap-4 p-4">
						<SupplierEditForm {...supplier} />
					</div>
				)}
			</DataLoading>
		</>
	);
}
