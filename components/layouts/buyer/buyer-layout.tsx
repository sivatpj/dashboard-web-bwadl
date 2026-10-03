import { BuyerHeader } from "./buyer-header";

export const BuyerLayout = (props: { children: React.ReactNode }) => {
	const { children } = props;

	return (
		<div className="flex h-screen flex-col gap-4 bg-gradient-to-r from-[#E8E9EA] to-[#E0F4FF]">
			<BuyerHeader />

			{children}
		</div>
	);
};
