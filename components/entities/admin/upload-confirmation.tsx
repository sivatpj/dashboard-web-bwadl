"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

interface UploadConfirmationProps {
	disabled?: boolean;
	onConfirm?: () => void;
}

export const UploadConfirmation = (props: UploadConfirmationProps) => {
	const { disabled = false, onConfirm } = props;

	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<button
					className="flex w-full items-center justify-between gap-24 rounded-lg bg-[#242424] px-4 py-4 font-bold text-white hover:opacity-75 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={disabled}
					type="button"
					onClick={() => setIsOpen(true)}
				>
					<span>Next</span>
					<ArrowRightIcon />
				</button>
			</DialogTrigger>

			<DialogContent className="flex w-full max-w-[65vw] flex-col gap-16 rounded-2xl bg-[#F0F8FD] px-16 py-10 shadow-[0px_4px_16px_rgba(0,0,0,0.08)]">
				<Card className="flex flex-col items-center justify-center gap-8 p-4">
					<DialogHeader>
						<DialogTitle className="text-center text-2xl font-bold text-[#141919]">Confirmation</DialogTitle>
					</DialogHeader>

					<span className="text-center">Are you sure you want to upload the documents?</span>
				</Card>

				<div className="flex justify-between gap-4">
					<button
						className="flex w-full items-center justify-center rounded-lg bg-[#242424] px-4 py-4 font-bold text-white hover:opacity-75 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
						type="button"
						onClick={() => {
							setIsOpen(false);
							onConfirm?.();
						}}
					>
						Yes, Upload
					</button>

					<button
						className="flex w-full items-center justify-center rounded-lg bg-[#D9D9D9] px-4 py-4 font-bold text-[#242424] hover:opacity-75 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
						type="button"
						onClick={() => setIsOpen(false)}
					>
						<span>Cancel</span>
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
