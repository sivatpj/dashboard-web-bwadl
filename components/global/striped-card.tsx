interface StripedCardProps {
	title: string;
	children: React.ReactNode;
	className?: string;
}

export const StripedCard = ({ title, children, className }: StripedCardProps) => {
	return (
		<div className={`flex-1 rounded-xl border border-gray-100 bg-white shadow-sm ${className || ""}`}>
			<div className="flex h-full">
				<div className="w-2  rounded-l-xl bg-[#2A82BE]" />
				<div className="flex-1 p-5">
					<h3 className="mb-4 text-base font-bold text-gray-900">{title}</h3>
					{children}
				</div>
			</div>
		</div>
	);
};

interface DetailRowProps {
	label: string;
	value: React.ReactNode;
}

export const DetailRow = ({ label, value }: DetailRowProps) => (
	<div className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0">
		<span className="text-sm text-gray-500">{label}</span>
		<span className="text-sm font-semibold text-gray-900">{value || "-"}</span>
	</div>
);
