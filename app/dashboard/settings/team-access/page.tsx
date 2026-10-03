"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Roles } from "@/components/settings/team-access/roles";
import { Users } from "@/components/settings/team-access/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSetParams } from "@/hooks/use-set-params";
import { cn } from "@/lib/utils";

export default function Page(props: PageProps<"/dashboard/settings/team-access">) {
	const setParams = useSetParams();

	const params = useSearchParams();
	const activeTab = params.get("tab") || "USERS";

	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<div className="flex-1">
			<Card className="mb-6 p-4">
				<CardContent className="flex items-center justify-between">
					<div className="flex h-full w-[260px] overflow-hidden rounded-md bg-white shadow-md">
						<button
							className={cn(
								"h-full flex-1 px-4 py-2 text-sm font-medium transition-all",
								activeTab === "USERS"
									? "rounded-md border-2 border-white bg-black text-white shadow-md"
									: "bg-white text-gray-600",
							)}
							type="button"
							onClick={() => setParams({ page: null, tab: "USERS" })}
						>
							Users
						</button>

						<button
							className={cn(
								"h-full flex-1 px-4 py-2 text-sm font-medium transition-all",
								activeTab === "ROLES"
									? "rounded-md border-2 border-white bg-black text-white shadow-md"
									: "bg-white text-gray-600",
							)}
							type="button"
							onClick={() => setParams({ page: null, tab: "ROLES" })}
						>
							Roles
						</button>
					</div>

					{activeTab === "USERS" && (
						<Button
							className="rounded-lg bg-black px-6 py-2 font-semibold text-white"
							onClick={() => setIsDialogOpen(true)}
						>
							Invite team member
						</Button>
					)}
				</CardContent>

				<CardContent>{activeTab === "USERS" ? <Users /> : <Roles />}</CardContent>
			</Card>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="h-[55%] w-[35%] rounded-lg bg-blue-50 p-6">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">Invite new team member</DialogTitle>
						<DialogDescription>Please enter the team member email</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<label className="block pb-1 pl-2 text-sm font-semibold">Email address</label>
							<Input className="w-full" placeholder="Email address" />
						</div>

						<div>
							<label className="mb-1 block pl-2 text-sm font-semibold">Role</label>

							<Select>
								<SelectTrigger>
									<SelectValue placeholder="Select Role" />
								</SelectTrigger>

								<SelectContent>
									<SelectItem value="Admin">Admin</SelectItem>
									<SelectItem value="User 1">User 1</SelectItem>
									<SelectItem value="User 2">User 2</SelectItem>
									<SelectItem value="User 3">User 3</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="flex items-center justify-center">
						<Button className="w-[60%] items-center justify-center bg-black text-white">Send Invitation</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
