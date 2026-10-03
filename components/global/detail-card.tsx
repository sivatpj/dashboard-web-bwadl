import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const DetailCard = ({ label, value, className }: { label: string; value: ReactNode; className?: string }) => (
	<div
		className={cn(
			"w-full rounded-[8px] border border-[#B8C8D3] bg-[linear-gradient(90deg,#DDE8EF_0%,#CBD9E3_100%)] px-6 py-4 xl:w-[320px]",
			className,
		)}
	>
		<p className="text-[14px] font-medium text-[#5F6870]">{label}</p>
		<div className="mt-2 text-[23px] font-bold text-[#404040]">{value}</div>
	</div>
);
