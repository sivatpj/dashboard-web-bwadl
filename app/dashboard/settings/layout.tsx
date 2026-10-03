"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LINKS = [
	{ href: "/dashboard/settings/", label: "My Profile" },
	{ href: "/dashboard/settings/security/", label: "Security" },
	{ href: "/dashboard/settings/languages/", label: "Languages" },
	{ href: "/dashboard/settings/upgrade-limit/", label: "Upgrade Limit" },
];

export default function Layout(props: LayoutProps<"/dashboard/settings">) {
	const { children } = props;

	const pathname = usePathname();

	return (
		<div className="flex flex-1 flex-col gap-4 px-4 pl-0">
			<h2 className="ml-8 mt-2 text-lg font-semibold">Settings</h2>

			<div className="flex h-full gap-4">
				<div className="flex w-[20%] flex-col gap-4">
					<Card className="flex flex-1 rounded-none rounded-r-md py-4">
						<ul className="flex w-full flex-col gap-4">
							{LINKS.map(link => (
								<li key={link.href} className="w-full">
									<Link
										className={cn(
											"block w-[80%] rounded-xl rounded-l-none px-4 py-2 transition-all hover:bg-gray-100 hover:shadow-sm",
											pathname === link.href
												? "bg-gradient-to-r from-[#E0F4FF] to-[#E8E9EA] font-bold"
												: "bg-transparent text-gray-600",
										)}
										href={link.href}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</Card>
				</div>

				{children}
			</div>
		</div>
	);
}
