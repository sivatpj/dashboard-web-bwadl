"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function Page(props: PageProps<"/dashboard/settings/notification">) {
	const [notifications, setNotifications] = useState({
		all: false,
		latePayment: true,
		offers: true,
		popup: true,
	});

	// Handle switch toggles
	const handleToggle = (key: keyof typeof notifications) => {
		if (key === "all") {
			const newState = !notifications.all;
			setNotifications({
				all: newState,
				latePayment: !newState,
				offers: !newState,
				popup: !newState,
			});
		} else {
			setNotifications(prev => ({
				...prev,
				[key]: !prev[key],
				all: false, // Uncheck "Turn off all" when toggling any other switch
			}));
		}
	};

	return (
		<div className="ml-8 flex-1">
			<Card className="mb-6 rounded-xl p-6 shadow-sm">
				<CardContent>
					<h2 className="mb-6 text-lg font-semibold">Notification Settings</h2>

					<div className="space-y-6">
						{/* Notification Toggles */}
						{[
							{ key: "popup", label: "Pop up Notification on desktop" },
							{ key: "offers", label: "New offers Notification" },
							{ key: "latePayment", label: "Late Payment Notification" },
						].map(({ key, label }) => (
							<div key={key} className="flex items-center justify-between">
								<span className="font-semibold text-gray-700">{label}</span>
								<Switch
									checked={notifications[key as keyof typeof notifications]}
									className="data-[state=checked]:bg-black"
									onCheckedChange={() => handleToggle(key as keyof typeof notifications)}
								/>
							</div>
						))}

						{/* Turn off all notifications */}
						<div className="flex items-center justify-between">
							<span className="font-semibold text-gray-700">Turn off all notifications</span>
							<Switch
								checked={notifications.all}
								className="data-[state=checked]:bg-gray-500"
								onCheckedChange={() => handleToggle("all")}
							/>
						</div>

						{/* Save Button */}
						<div className="flex justify-end">
							<Button className="rounded-lg bg-black px-6 py-3 text-lg text-white">Save</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
