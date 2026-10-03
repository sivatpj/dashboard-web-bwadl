import { IAccount } from "@/api/types";

interface AccountTypePillProps {
	type: IAccount["accountType"];
}

export const AccountTypePill = (props: AccountTypePillProps) => {
	const { type } = props;

	return (
		<span className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-xs font-medium text-gray-600">
			{type}
		</span>
	);
};
