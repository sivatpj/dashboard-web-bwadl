"use client";

import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { useTranslationContext } from "@/contexts/translation";
import { HomeExecutiveDashboard, HomeFinances, HomeInsurers, HomeMerchants } from "./home";

export const AdminDashboard = () => {
	const { t } = useTranslationContext();

	return (
		<div className="flex h-full flex-col gap-4 px-4 py-4">
			<div className="flex items-center justify-end">
				<Button className="w-48">
					<Icon className="h-4 w-4 fill-white" name="PlusBox" />
					{t("admin.home.generate-reports")}
				</Button>
			</div>

			<div className="flex flex-col gap-2">
				<label className="font-bold">{t("admin.home.executive-dashboard")}</label>

				<HomeExecutiveDashboard />
			</div>

			<div className="flex gap-2">
				<div className="flex flex-[1] flex-col gap-2">
					<label className="font-bold">{t("admin.home.suppliers")}</label>

					<HomeMerchants />
				</div>

				<div className="flex flex-[2] flex-col gap-2">
					<label className="font-bold">{t("admin.home.financiers")}</label>

					<HomeFinances />
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<label className="font-bold">{t("admin.home.insurers")}</label>

				<HomeInsurers />
			</div>
		</div>
	);
};
