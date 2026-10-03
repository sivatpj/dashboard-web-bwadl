"use client";

import { use } from "react";
import { useFetchAccountingAccount } from "@/api/endpoints/back-office/accounting/fetch-account";
import { AccountInformation } from "@/components/entities/admin/dashboard/statements";
import { DataLoading } from "@/components/global/data-loading";
import { BreadcrumbTitles } from "@/contexts/breadcrumbs";
import { useTranslationContext } from "@/contexts/translation";

export default function Page(props: PageProps<"/dashboard/statements/[id]">) {
	const { id } = use(props.params);

	const { t } = useTranslationContext();

	const { data, isLoading } = useFetchAccountingAccount({
		id,
	});

	return (
		<>
			<BreadcrumbTitles
				crumbs={[
					{
						position: 0,
						title: t("admin.statements.statements"),
					},
					{
						position: 1,
						title: data?.account.accountCode,
					},
				]}
				isLoading={isLoading}
			/>

			<DataLoading isLoading={isLoading} data={data?.account}>
				{account => (
					<div className="flex h-full flex-col gap-4 px-4 py-4">
						<div className="flex flex-col gap-4">
							<AccountInformation {...account} />
						</div>
					</div>
				)}
			</DataLoading>
		</>
	);
}
