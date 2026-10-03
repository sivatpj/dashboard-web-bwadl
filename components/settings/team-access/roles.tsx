"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const Roles = () => {
	const initialRolesData = [
		{
			permissions: [true, true, true, true, true, true],
			title: "Admin",
		},
		{
			permissions: [false, false, true, true, true, true],
			title: "User 1",
		},
		{
			permissions: [false, false, false, true, true, true],
			title: "User 2",
		},
		{
			permissions: [false, false, false, true, false, true],
			title: "User 3",
		},
	];

	const [rolesData, setRolesData] = useState(initialRolesData);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newRoleTitle, setNewRoleTitle] = useState("");

	const handleCheckboxChange = (roleIndex: number, permissionIndex: number) => {
		const updatedRoles = [...rolesData];
		updatedRoles[roleIndex].permissions[permissionIndex] = !updatedRoles[roleIndex].permissions[permissionIndex];
		setRolesData(updatedRoles);
	};

	const handleAddNewRole = () => {
		if (newRoleTitle.trim() === "") return; // Ensure the role title is not empty

		const newRole = {
			permissions: [false, false, false, false, false, false], // Default permissions
			title: newRoleTitle,
		};
		setRolesData([...rolesData, newRole]);
		setIsDialogOpen(false);
		setNewRoleTitle("");
	};

	return (
		<div>
			<Card>
				<table className="w-full border-collapse">
					<thead>
						<tr className="bg-gray-100">
							<th className="px-4 py-3 text-left">Role Title</th>
							<th>Modify Users</th>
							<th>Delivery Confirmation</th>
							<th>Upgrade Limit</th>
							<th>Download Reports</th>
							<th>Make Transaction</th>
							<th>Activation Status</th>
						</tr>
					</thead>
					<tbody>
						{rolesData.map((role, roleIndex) => (
							<tr key={roleIndex} className="border-t">
								<td className="px-4 py-3">{role.title}</td>
								{role.permissions.map((hasPermission, permissionIndex) => (
									<td key={permissionIndex} className="text-center">
										<input
											checked={hasPermission}
											className="form-checkbox h-5 w-5 rounded border-black bg-black text-white accent-black"
											type="checkbox"
											onChange={() => handleCheckboxChange(roleIndex, permissionIndex)}
										/>
									</td>
								))}
							</tr>
						))}
						<tr>
							<td colSpan={7}>
								<hr className="border-gray-300" />
							</td>
						</tr>
						<tr>
							<td className="px-4 py-3" colSpan={7}>
								<button type="button" onClick={() => setIsDialogOpen(true)}>
									Add new...
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</Card>

			<div className="mt-6 flex justify-end">
				<Button className="rounded-md bg-black px-8 py-3 text-white">Save</Button>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="h-[30%] w-[25%]">
					<DialogHeader>
						<DialogTitle>Add New Role</DialogTitle>
						<DialogClose />
					</DialogHeader>
					<div className="space-y-4">
						<Input placeholder="Role Title" value={newRoleTitle} onChange={e => setNewRoleTitle(e.target.value)} />
						<Button
							className="w-full bg-black text-white"
							disabled={newRoleTitle.trim() === ""}
							onClick={handleAddNewRole}
						>
							Add Role
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
