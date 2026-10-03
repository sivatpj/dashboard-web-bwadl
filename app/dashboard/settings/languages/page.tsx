"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function Page(props: PageProps<"/dashboard/settings/languages">) {
	const [selectedLanguage, setSelectedLanguage] = useState("English");

	return (
		<div className="flex-1">
			<Card className="rounded-xl p-6 shadow-sm">
				<CardContent>
					<div className="mb-4 flex items-center justify-between">
						<span className="text-lg text-gray-700">اللغه العربية</span>
						<Switch checked={selectedLanguage === "Arabic"} onCheckedChange={() => setSelectedLanguage("Arabic")} />
					</div>

					<div className="mb-6 flex items-center justify-between">
						<span className="text-lg text-gray-700">English</span>
						<Switch checked={selectedLanguage === "English"} onCheckedChange={() => setSelectedLanguage("English")} />
					</div>

					<div className="flex justify-end pt-48">
						<Button className="w-[20%] rounded-lg bg-black px-6 py-3 text-lg text-white">Save</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
