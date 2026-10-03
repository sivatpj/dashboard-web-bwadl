import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChangePasswordDialog } from "@/components/entities/shared/change-password-dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { config } from "@/constants/config";
import { useAuthContext } from "@/contexts/auth";
import { cn } from "@/lib/utils";
import { Icon } from "../../global/icon";

export const BuyerHeader = () => {
	const pathname = usePathname();
	const { logout } = useAuthContext();
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

	const blockList: string[] = [];

	if (blockList.includes(pathname)) return null;

	const navConfig = [
		{
			path: config.PATHS.dashboard.BUYER.home,
			title: "Dashboard",
		},
		{
			path: config.PATHS.dashboard.BUYER.myOrders,
			title: "My Orders",
		},
		// {
		// 	title: "Merchants",
		// 	path: config.PATHS.dashboard.merchants,
		// },
	];

	const roles = [
		{
			label: "Buyer",
			value: "buyer",
		},
		{
			label: "Seller",
			value: "seller",
		},
		{
			label: "Financier",
			value: "financier",
		},
	];

	return (
		<header className="-mb-4 flex flex-col px-4">
			<div className="flex flex-1 gap-16 px-4">
				<img alt="bwadl logo" className="h-14 py-2" src="/static/assets/logo/logo.svg" />

				<div className="ml-16 flex flex-1 items-center gap-16">
					{navConfig.map(item => {
						const isActive = pathname === item.path;

						return (
							<Link
								key={item.path}
								className={cn(
									"relative flex flex-col items-center text-[#595959] transition-colors",
									isActive ? "font-bold text-black" : "hover:underline",
								)}
								href={item.path}
							>
								<span className="text-base">{item.title}</span>
								{isActive && (
									<svg
										className="-bottom-3"
										fill="none"
										height="13"
										viewBox="0 0 31 13"
										width="31"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M0.251953 12.7637L15.5586 0.290324L30.8669 12.7637H0.251953Z" fill="#C3C4C5" />
									</svg>
								)}
							</Link>
						);
					})}
				</div>

				<div className="flex h-full items-center justify-between gap-8">
					<Select>
						<SelectTrigger className="h-10 w-[180px]">
							<SelectValue placeholder="Select a fruit" />
						</SelectTrigger>

						<SelectContent>
							<SelectGroup>
								<SelectLabel>-- CR --</SelectLabel>
								<SelectItem value="apple">Apple</SelectItem>
								<SelectItem value="banana">Banana</SelectItem>
								<SelectItem value="blueberry">Blueberry</SelectItem>
								<SelectItem value="grapes">Grapes</SelectItem>
								<SelectItem value="pineapple">Pineapple</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>

					<Select>
						<SelectTrigger className="h-10 w-[180px]">
							<SelectValue placeholder="Select a role" />
						</SelectTrigger>

						<SelectContent>
							<SelectGroup>
								<SelectLabel>-- Role --</SelectLabel>
								{roles.map(role => (
									<SelectItem key={role.value} value={role.value}>
										{role.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					{/* <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-50" type="button">
						<Icon name={emailCount > 0 ? "email-active" : "email"} />
					</button> */}

					{/* <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-50" type="button">
						<Icon name={notificationCount > 0 ? "notification-active" : "notification"} />
					</button> */}
					<div className="flex flex-1">
						<Link
							className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-50"
							href={config.PATHS.dashboard.BUYER.settings}
						>
							<Icon name="Gear" />
						</Link>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger
									className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-50"
									onClick={() => setIsChangePasswordOpen(true)}
									type="button"
								>
									<Lock className="h-4 w-4 text-[#404040]" />
								</TooltipTrigger>
								<TooltipContent>Change Password</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger
									className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-50"
									onClick={logout}
								>
									<Icon name="SignOut" />
								</TooltipTrigger>
								<TooltipContent>Sign out</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</div>

			<hr className="h-[1px] w-full border-t-0 border-t-[#C3C4C5] bg-[#C3C4C5]" />

			<ChangePasswordDialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
		</header>
	);
};
