"use client";

import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Page(props: PageProps<"/dashboard/settings/upgrade-limit">) {
	return (
		<div className="flex-1">
			<Card className="mb-6 rounded-xl p-6 shadow-sm">
				<CardContent>
					<div className="mb-6">
						<label className="mb-2 block font-semibold text-gray-700">Current Limit</label>

						<div className="flex w-[50%] items-center justify-between rounded-lg border bg-white px-4 py-3">
							<span className="text-lg font-bold">22,500</span>
							<Icon name="Riyal" />
						</div>
					</div>

					<div className="mb-6">
						<label className="mb-2 block font-semibold text-gray-700">Requested Limit</label>

						<div className="flex w-[50%] items-center justify-between rounded-lg border bg-white px-4 py-3">
							<input
								className="w-full border-none bg-transparent text-lg font-bold focus:outline-none"
								defaultValue="22,500"
								type="text"
							/>
							<Icon name="Riyal" />
						</div>
					</div>

					<div className="flex justify-end">
						<Button className="rounded-lg bg-black px-6 py-3 text-lg text-white">Send request</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
