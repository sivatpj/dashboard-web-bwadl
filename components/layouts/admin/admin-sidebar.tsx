import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useFetchWhoAmI } from "@/api/endpoints/fetch-who-am-i";
import { IconMapping } from "@/components/global/icons";
import { config } from "@/constants/config";
import { useTranslationContext } from "@/contexts/translation";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Icon } from "../../global/icon";

const ADMIN_CENTER_EMAILS = ["sivashankaran@techchasesoftware.com", "hameed@techchasesoftware.com"];

export const AdminSidebar = () => {
	const pathname = usePathname();
	const [isExpanded, setIsExpanded] = useState(false);
	const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

	const { t } = useTranslationContext();
	const { data: whoAmIData } = useFetchWhoAmI();

	const isAdminCenterUser = ADMIN_CENTER_EMAILS.includes((whoAmIData?.user?.email || "").toLowerCase());

	const toggleGroup = (label: string) => {
		setExpandedGroups(prev => (prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]));
	};

	const navItems: Array<{
		label: string;
		path: string;
		icon: IconMapping;
		children?: Array<{ label: string; path: string }>;
	}> = [
		{
			icon: "Home",
			label: t("admin.sidebar.home"),
			path: config.PATHS.dashboard.ADMIN.home,
		},
		{
			icon: "Buyer",
			label: t("admin.sidebar.buyers"),
			path: config.PATHS.dashboard.ADMIN.buyers,
		},
		{
			icon: "Supplier",
			label: t("admin.sidebar.suppliers"),
			path: config.PATHS.dashboard.ADMIN.suppliers,
		},
		{
			icon: "Insurer",
			label: t("admin.sidebar.insurers"),
			path: config.PATHS.dashboard.ADMIN.insurers,
		},
		{
			icon: "Collector",
			label: t("admin.sidebar.collectors"),
			path: config.PATHS.dashboard.ADMIN.collectors,
		},
		{
			icon: "Financier",
			label: t("admin.sidebar.financiers"),
			path: config.PATHS.dashboard.ADMIN.financiers,
		},
		{
			icon: "Transfer",
			label: t("admin.sidebar.transfers"),
			path: config.PATHS.dashboard.ADMIN.transfers,
		},
		{
			icon: "Transaction",
			label: t("admin.sidebar.transactions"),
			path: config.PATHS.dashboard.ADMIN.transactions,
		},
		...(isAdminCenterUser
			? [
					{
						icon: "Accounts" as IconMapping,
						label: t("admin.sidebar.accounts"),
						path: config.PATHS.dashboard.ADMIN.accounts,
					},
				]
			: []),
		{
			icon: "Statements",
			label: t("admin.sidebar.bank-statements"),
			path: config.PATHS.dashboard.ADMIN.statements,
		},
		{
			icon: "Bank",
			label: t("admin.sidebar.banks"),
			path: config.PATHS.dashboard.ADMIN.banks,
		},
		{
			icon: "File",
			label: t("admin.sidebar.reports"),
			path: "",
			children: [
				{
					label: t("admin.sidebar.overdue-sales-orders-report"),
					path: config.PATHS.dashboard.ADMIN.overdueSalesOrdersReport,
				},
			],
		},
		{
			icon: "Upload",
			label: t("admin.sidebar.file-upload"),
			path: "",
			children: [
				{
					label: t("admin.sidebar.file-upload-list"),
					path: config.PATHS.dashboard.ADMIN.fileUploadList,
				},
				{
					label: t("admin.sidebar.file-upload-ignore-list"),
					path: config.PATHS.dashboard.ADMIN.fileUploadIgnoreList,
				},
				/* {
					label: t("admin.sidebar.file-upload-escalation-report"),
					path: config.PATHS.dashboard.ADMIN.fileUploadEscalationReport,
				}, */
			],
		},
		...(isAdminCenterUser
			? [
					{
						icon: "Gear" as IconMapping,
						label: t("admin.sidebar.admin-center"),
						path: "",
						children: [
							{
								label: t("admin.sidebar.users"),
								path: config.PATHS.dashboard.ADMIN.adminCenter.users,
							},
						],
					},
				]
			: []),
	];

	const isGroupActive = (item: { children?: Array<{ path: string }> }) =>
		item.children?.some(child => pathname.startsWith(child.path)) ?? false;

	return (
		<div
			className={cn(
				"fixed z-10 flex min-h-screen flex-col gap-8 border border-input bg-white p-4 shadow-sm transition-all duration-300 ease-in-out",
				isExpanded ? "w-[250px]" : "w-[56px]",
			)}
			onMouseEnter={() => setIsExpanded(true)}
			onMouseLeave={() => setIsExpanded(false)}
		>
			<div className="size-14">
				<img
					alt="logo"
					className={cn(isExpanded ? "size-14" : "size-5", "transition-all duration-300 ease-in-out")}
					src="/static/assets/logo/logo.svg"
				/>
			</div>

			<div className="flex flex-col gap-4 ltr:-ml-4 rtl:-mr-4">
				{navItems.map(item => {
					if (item.children) {
						const groupOpen = expandedGroups.includes(item.label) || isGroupActive(item);
						return (
							<div key={item.label}>
								<button
									type="button"
									className={cn(
										"flex w-full items-center gap-2 rounded-xl py-2 transition-all hover:bg-gray-100 hover:shadow-sm ltr:rounded-l-none rtl:rounded-r-none",
										isGroupActive(item)
											? "bg-gradient-to-r from-[#E0F4FF] to-[#E8E9EA] font-bold"
											: "bg-transparent text-gray-600",
										isExpanded ? "px-4" : "ltr:pl-4 ltr:pr-8 rtl:pr-4 rtl:pl-8",
									)}
									onClick={() => {
										if (isExpanded) toggleGroup(item.label);
									}}
								>
									<Icon className="size-5 flex-shrink-0" name={item.icon} />
									<span
										className={cn(
											"flex flex-1 items-center justify-between text-sm transition-all duration-300 ease-in-out whitespace-nowrap",
											isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0 overflow-hidden",
										)}
									>
										{item.label}
										<ChevronDown
											className={cn(
												"h-4 w-4 transition-transform duration-200",
												groupOpen ? "rotate-180" : "",
											)}
										/>
									</span>
								</button>

								{groupOpen && isExpanded && (
									<div className="mt-1 flex flex-col gap-1 ltr:pl-8 rtl:pr-8">
										{item.children.map(child => (
											<Link
												key={child.path}
												href={child.path}
												className={cn(
													"flex items-center rounded-lg px-3 py-1.5 text-xs transition-all hover:bg-gray-100",
													pathname.startsWith(child.path)
														? "bg-gradient-to-r from-[#E0F4FF] to-[#E8E9EA] font-semibold"
														: "text-gray-600",
												)}
											>
												{child.label}
											</Link>
										))}
									</div>
								)}
							</div>
						);
					}

					return (
						<Link
							key={item.label}
							className={cn(
								"flex items-center gap-2 rounded-xl py-2 transition-all hover:bg-gray-100 hover:shadow-sm ltr:rounded-l-none rtl:rounded-r-none",
								pathname === item.path
									? "bg-gradient-to-r from-[#E0F4FF] to-[#E8E9EA] font-bold"
									: "bg-transparent text-gray-600",
								isExpanded ? "px-4" : "ltr:pl-4 ltr:pr-8 rtl:pr-4 rtl:pl-8",
							)}
							href={item.path}
						>
							<Icon className="size-5 flex-shrink-0" name={item.icon} />
							<span
								className={cn(
									"text-sm transition-all duration-300 ease-in-out whitespace-nowrap",
									isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0 overflow-hidden",
								)}
							>
								{item.label}
							</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
};
