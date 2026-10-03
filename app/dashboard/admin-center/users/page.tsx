"use client";

import dayjs from "dayjs";
import { CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { IAdminUser, useFetchUsers } from "@/api/endpoints/back-office/users/fetch-users";
import { UserEditPopUp, UsersHeader } from "@/components/entities/admin/dashboard/users";
import { HighlightText } from "@/components/global/highlight-text";
import { Pagination } from "@/components/global/pagination";
import { DataTable } from "@/components/ui/data-table";
import { config } from "@/constants/config";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";
import { useSetParams } from "@/hooks/use-set-params";

const VerifiedBadge = ({ verified }: { verified?: boolean }) =>
	verified ? (
		<CheckCircle2 className="h-4 w-4 text-emerald-600" />
	) : (
		<XCircle className="h-4 w-4 text-gray-300" />
	);

export default function Page() {
	const params = useSearchParams();
	const setParams = useSetParams();
	const { t } = useTranslationContext();

	const [editUser, setEditUser] = useState<IAdminUser | null>(null);

	const q = params.get("search") || "";
	const page = Number(params.get("page") || "1");
	const pageSize = Number(params.get("pageSize") || localStorage.getItem(config.LOCAL_STORAGE_KEYS.PAGE_SIZE) || "10");

	const { data, isLoading } = useFetchUsers({ limit: pageSize, page, q });

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.users.list-of-users"),
					},
				]}
			/>

			<div className="flex h-full flex-col gap-4 px-4 py-4">
				<UsersHeader />

				<div className="flex overflow-hidden rounded-xl border border-gray-100">
					<div className="w-1.5 shrink-0 bg-gradient-to-b from-[#4AADE7] to-[#2D8BC9]" />
					<DataTable
						className="flex-1"
						data={data?.users}
						headers={[
							{
								key: "nameEn",
								label: t("admin.users.name-en"),
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							{
								key: "nameAr",
								label: t("admin.users.name-ar"),
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							{
								key: "email",
								label: t("admin.users.email"),
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							{
								key: "mobile",
								label: t("admin.users.mobile"),
								render: value => <HighlightText query={q} text={String(value ?? "")} />,
							},
							{
								label: t("admin.users.identity-id"),
								render: (_, row) => row.identity?.id || "-",
							},
							{
								label: t("admin.users.identity-type"),
								render: (_, row) => row.identity?.type?.toUpperCase() || "-",
							},
							{
								alignment: "center",
								label: t("admin.users.is-email-verified"),
								render: (_, row) => <VerifiedBadge verified={row.isEmailVerified} />,
							},
							{
								alignment: "center",
								label: t("admin.users.is-mobile-verified"),
								render: (_, row) => <VerifiedBadge verified={row.isMobileVerified} />,
							},
							{
								alignment: "center",
								label: t("admin.users.is-user-verified"),
								render: (_, row) => <VerifiedBadge verified={row.isUserVerified} />,
							},
							{
								label: t("admin.users.joined"),
								nowrap: true,
								render: (_, row) => (row.createdAt ? dayjs(row.createdAt).format("DD/MM/YYYY") : "-"),
							},
						]}
						loading={isLoading}
						onEdit={row => setEditUser(row)}
					/>
				</div>

				<Pagination
					currentCount={data?.users.length}
					page={page}
					perPage={pageSize}
					setPage={page => setParams({ page })}
					totalCount={data?.totalCount}
					setPerPage={pageSize => setParams({ page: null, pageSize })}
					showing
				/>
			</div>

			{editUser && (
				<UserEditPopUp
					open
					user={editUser}
					onOpenChange={open => {
						if (!open) setEditUser(null);
					}}
				/>
			)}
		</>
	);
}
