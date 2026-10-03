import { Pencil } from "lucide-react";
import { useState } from "react";
import { Pagination } from "@/components/global/pagination";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const teamMembers = [
	{
		active: true,
		contact: "0512365485",
		email: "Hashem@taza.sa",
		name: "Hashem Alqarooni",
		role: "Admin",
	},
	{
		active: true,
		contact: "05185214786",
		email: "Alia@taza.sa",
		name: "Ali Alaali",
		role: "User 1",
	},
	{
		active: true,
		contact: "0512365485",
		email: "Mona@taza.sa",
		name: "Mona Rashid",
		role: "User 3",
	},
	{
		active: false,
		contact: "05185214786",
		email: "Aliq@taza.sa",
		name: "Ali AlQassab",
		role: "User 1",
	},
	{
		active: true,
		contact: "0512365485",
		email: "Mohammedj@taza.sa",
		name: "Mohammed Jassim",
		role: "User 2",
	},
	{
		active: true,
		contact: "05185214786",
		email: "Sara@taza.sa",
		name: "Sara AlHaddi",
		role: "User 1",
	},
	{
		active: true,
		contact: "0512365485",
		email: "Mohammeda@taza.sa",
		name: "Mohammed Abdulla",
		role: "User 2",
	},
];

export const Users = () => {
	const [members, setMembers] = useState(teamMembers);

	const handleToggle = (index: number) => {
		setMembers(prev => prev.map((member, i) => (i === index ? { ...member, active: !member.active } : member)));
	};

	return (
		<div className="w-full">
			<div className="overflow-hidden rounded-lg border border-gray-200">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="bg-gray-200 text-left font-semibold text-gray-700">
							<th className="p-4">Name</th>
							<th className="p-4">Contact Number</th>
							<th className="p-4">Email address</th>
							<th className="p-4">Role</th>
							<th className="p-4 text-center">Activation status</th>
							<th className="p-4 text-center">Edit</th>
						</tr>
					</thead>

					<tbody>
						{members.map((member, index) => (
							<tr key={index} className="border-b text-gray-700">
								<td className="p-4">{member.name}</td>
								<td className="p-4">{member.contact}</td>
								<td className="p-4">{member.email}</td>
								<td className="p-4">{member.role}</td>
								<td className="p-4 text-center">
									<Switch checked={member.active} onCheckedChange={() => handleToggle(index)} />
								</td>
								<td className="p-4 text-center">
									<Button size="icon" variant="outline">
										<Pencil size={16} />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="pt-4">
				<Pagination />
			</div>
		</div>
	);
};
