"use client";

import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Page(props: PageProps<"/dashboard/settings/security">) {
	const [password, setPassword] = useState("");

	const rules = [
		{ id: 1, text: "Minimum of 8 characters", valid: password.length >= 8 },
		{ id: 2, text: "1 uppercase characters", valid: /[A-Z]/.test(password) },
		{ id: 3, text: "1 lowercase characters", valid: /[a-z]/.test(password) },
		{ id: 4, text: "1 numeric characters", valid: /\d/.test(password) },
		{
			id: 5,
			text: "1 special characters",
			valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
		},
	];

	return (
		<div className="flex-1">
			<Card className="rounded-xl p-6 shadow-sm">
				<CardContent>
					<div className="space-y-6">
						<div>
							<label className="mb-2 block text-sm text-gray-700">Old Password</label>
							<Input className="h-12 w-[49%] rounded-lg border-gray-300" placeholder="Old Password" type="password" />
						</div>

						<div className="grid grid-cols-2 gap-6">
							<div>
								<label className="mb-2 block text-sm text-gray-700">New Password</label>
								<Input
									className="h-12 w-full rounded-lg border-gray-300"
									placeholder="New Password"
									type="password"
									value={password}
									onChange={e => setPassword(e.target.value)}
								/>
							</div>
							{/*
							<div>
								<label className="mb-2 block text-gray-700">Confirm New Password</label>
								<Input
									className="h-12 w-full rounded-lg border-gray-300"
									placeholder="Confirm New Password"
									type="password"
									value={confirmPassword}
									onChange={e => setConfirmPassword(e.target.value)}
								/>
							</div> */}
						</div>

						<div className="space-y-2">
							{rules.map(rule => (
								<div key={rule.id} className="flex items-center space-x-2 text-sm">
									{rule.valid ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Icon name="X" />}
									<span className={rule.valid ? "text-green-600" : "text-gray-600"}>{rule.text}</span>
								</div>
							))}
						</div>

						<div className="flex justify-end">
							<Button className="text-md rounded-lg bg-black px-6 py-3 text-white">Change Password</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
