"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFetchSuppliers } from "@/api/endpoints/back-office/suppliers/fetch-suppliers";
import { SuppliersHeader } from "@/components/entities/admin/dashboard/suppliers";
import { DeleteSupplierPopUp } from "@/components/entities/admin/dashboard/suppliers/delete-supplier-pop-up";
import { FormattedNumber } from "@/components/global/formatted-number";
import { HighlightText } from "@/components/global/highlight-text";
import { Pagination } from "@/components/global/pagination";
import { RiyalTitle } from "@/components/global/riyal-title";
import { DataTable } from "@/components/ui/data-table";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

export default function Page(props: PageProps<"/dashboard/suppliers">) {
	const params = useSearchParams();
	const setParams = useSetParams();
	const router = useRouter();

	const { t } = useTranslationContext();
	const [deleteSupplierId, setDeleteSupplierId] = useState<number | null>(null);

	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const q = params.get("search") || "";

	const { data, isLoading } = useFetchSuppliers({
		limit: pageSize,
		page,
		q,
	});

	const sortedSuppliers = data?.suppliers ? [...data.suppliers].sort((a, b) => b.id - a.id) : data?.suppliers;

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.suppliers.list-of-suppliers"),
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<SuppliersHeader />

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={sortedSuppliers}
						headers={[
						//	{ key: "id", label: t("admin.suppliers.id") },
							{ key: "crNumber", label: t("admin.suppliers.cr-number"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
							{ key: "supplierName", label: t("admin.suppliers.name"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
							{ key: "facilityName", label: t("admin.suppliers.facility-name"), render: value => <HighlightText query={q} text={String(value ?? "")} /> },
							{
								alignment: "right",
								key: "limit",
								label: <RiyalTitle>{t("admin.suppliers.limit")}</RiyalTitle>,
								render: value => <FormattedNumber value={value} />,
							},
							{
								alignment: "right",
								key: "calcAvailableLimit",
								label: <RiyalTitle>{t("admin.suppliers.available-limit")}</RiyalTitle>,
								render: value => <FormattedNumber value={value} />,
							},
							/* {
								alignment: "right",
								key: "totalFinanced",
								label: <RiyalTitle>{t("admin.suppliers.total-financed")}</RiyalTitle>,
								render: value => <FormattedNumber value={value} />,
							}, */
							{
								alignment: "right",
								label: <RiyalTitle>{t("admin.suppliers.outstanding")}</RiyalTitle>,
								render: (_, row) => <FormattedNumber value={row.limit - row.calcAvailableLimit} />,
							},
							{
								key: "totalDelays",
								label: t("admin.suppliers.total-delays"),
							},
							{
								key: "pendingDeliveryCount",
								label: t("admin.suppliers.pending-delivery-invoices"),
							},
						]}
						loading={isLoading}
						onClick={row => router.push(config.PATHS.dashboard.ADMIN.supplier(row.id))}
						onOpen={row => router.push(config.PATHS.dashboard.ADMIN.supplier(row.id))}
						onEdit={row => router.push(config.PATHS.dashboard.ADMIN.editSupplier(row.id))}
						onDelete={row => setDeleteSupplierId(row.id)}
					/>
				</div>

				{deleteSupplierId && (
					<DeleteSupplierPopUp
						supplierId={deleteSupplierId}
						open
						onOpenChange={open => {
							if (!open) setDeleteSupplierId(null);
						}}
					/>
				)}

				<Pagination
					currentCount={data?.suppliers.length}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={data?.totalCount}
					setPerPage={pageSize => setParams({ page: null, pageSize })}
					showing
				/>
			</div>
		</>
	);
}
