"use client";

import { useState } from "react";
import { Icon } from "@/components/global/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Page(props: PageProps<"/dashboard/settings">) {
	const [isEditing, setIsEditing] = useState(false);

	return (
		<div className="flex-1">
			<Card className="rounded-b-none rounded-t-lg p-6">
				<CardContent className="flex flex-col gap-8">
					<div className="flex items-center justify-between">
						<div className="flex w-[40%] flex-col">
							<label className="text-sm text-gray-600" htmlFor="fullName">
								Full Name
							</label>

							<input
								className={`text-md mt-1 rounded-md border p-2 ${
									isEditing ? "border-gray-500" : "border-gray-300 bg-gray-100"
								}`}
								defaultValue="Hashem AlQarooni"
								disabled={!isEditing}
								id="fullName"
								placeholder="Enter your full name"
								type="text"
							/>
						</div>

						<Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
							{isEditing ? "Save" : "Edit"}
							<Icon className="ml-4" name="Edit" />
						</Button>
					</div>

					<div className="flex flex-col">
						<label className="text-sm text-gray-600" htmlFor="mobileNumber">
							Mobile Number
						</label>

						<input
							className={`text-md mt-1 w-[40%] rounded-md border p-2 ${
								isEditing ? "border-gray-500" : "border-gray-300 bg-gray-100"
							}`}
							defaultValue="+973 33355188"
							disabled={!isEditing}
							id="mobileNumber"
							placeholder="Enter your mobile number"
							type="text"
						/>
					</div>

					<div className="flex flex-col">
						<label className="text-sm text-gray-600" htmlFor="emailAddress">
							Email Address
						</label>

						<input
							className={`text-md mt-1 w-[40%] rounded-md border p-2 ${
								isEditing ? "border-gray-500" : "border-gray-300 bg-gray-100"
							}`}
							defaultValue="halqarooni@taza.sa"
							disabled={!isEditing}
							id="emailAddress"
							placeholder="Enter your email address"
							type="email"
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="rounded-b-lg rounded-t-none p-6">
				<CardContent className="flex flex-col gap-8">
					<div className="flex items-center justify-between">
						<div className="flex w-[40%] flex-col">
							<label className="text-sm text-gray-600" htmlFor="fullName">
								CR Name
							</label>

							<input
								className={`text-md mt-1 rounded-md border p-2 ${
									isEditing ? "border-gray-500" : "border-gray-300 bg-gray-100"
								}`}
								defaultValue="Hashem AlQarooni"
								disabled={!isEditing}
								id="fullName"
								placeholder="Enter your full name"
								type="text"
							/>
						</div>
					</div>

					<div className="flex flex-col">
						<label className="text-sm text-gray-600" htmlFor="mobileNumber">
							CR Number
						</label>

						<input
							className={`text-md mt-1 w-[40%] rounded-md border p-2 ${
								isEditing ? "border-gray-500" : "border-gray-300 bg-gray-100"
							}`}
							defaultValue="+966 33355188123"
							disabled={!isEditing}
							id="mobileNumber"
							placeholder="Enter your mobile number"
							type="text"
						/>
					</div>

					<div className="flex flex-col">
						<label className="text-sm text-gray-600" htmlFor="emailAddress">
							CR Office Number
						</label>
						<input
							className={`text-md mt-1 w-[40%] rounded-md border p-2 ${
								isEditing ? "border-gray-500" : "border-gray-300 bg-gray-100"
							}`}
							defaultValue="halqarooni@taza.sa"
							disabled={!isEditing}
							id="emailAddress"
							placeholder="Enter your email address"
							type="email"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
