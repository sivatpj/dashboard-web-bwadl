"use client";

import { AlertCircle, CheckCircle2, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ProgressStep = "uploading" | "processing" | "done" | "error";

interface ProgressModalProps {
	step: ProgressStep;
	errorMessage?: string;
	skipUploadStep?: boolean;
	labels?: {
		uploading?: string;
		processing?: string;
		done?: string;
		uploadingDescription?: string;
		processingDescription?: string;
		failedTitle?: string;
	};
	onClose: () => void;
}

export function ProgressModal({ step, errorMessage, skipUploadStep, labels, onClose }: ProgressModalProps) {
	const isError = step === "error";
	const isDone = step === "done";

	const steps: { id: ProgressStep; label: string }[] = [
		...(skipUploadStep ? [] : [{ id: "uploading" as const, label: labels?.uploading ?? "Uploading file" }]),
		{ id: "processing", label: labels?.processing ?? "Processing records" },
		{ id: "done", label: labels?.done ?? "Complete" },
	];

	const activeIndex = steps.findIndex(s => s.id === step);
	const resolvedIndex = isDone ? steps.length - 1 : activeIndex;
	const progressPercent = isDone ? 100 : (resolvedIndex / (steps.length - 1)) * 100;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
			<div className="relative w-full max-w-sm rounded-[8px] border border-[#D9D9D9] bg-white p-6 shadow-xl">
				{(isError || isDone) && (
					<button
						className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
						onClick={onClose}
					>
						<X className="h-4 w-4" />
					</button>
				)}

				<div className="flex flex-col items-center gap-5">
					{/* Icon */}
					<div
						className={`flex h-14 w-14 items-center justify-center rounded-full ${
							isError ? "bg-red-50" : isDone ? "bg-green-50" : "bg-[#f5f5f5]"
						}`}
					>
						{isError ? (
							<AlertCircle className="h-7 w-7 text-red-500" />
						) : isDone ? (
							<CheckCircle2 className="h-7 w-7 text-green-600" />
						) : (
							<FileUp className="h-7 w-7 text-[#404040]" />
						)}
					</div>

					{/* Title */}
					<div className="text-center">
						<p className="text-sm font-semibold text-[#404040]">
							{isError ? (labels?.failedTitle ?? "Upload Failed") : isDone ? (labels?.done ?? "Upload Complete") : (step === "uploading" ? (labels?.uploading ?? "Uploading File") : (labels?.processing ?? "Processing Records"))}
						</p>
						{!isError && !isDone && (
							<p className="mt-1 text-xs text-gray-500">
								{step === "uploading"
									? (labels?.uploadingDescription ?? "Uploading your file to the server…")
									: (labels?.processingDescription ?? "Processing and reconciling records…")}
							</p>
						)}
						{isError && errorMessage && (
							<p className="mt-1 text-xs text-red-500">{errorMessage}</p>
						)}
					</div>

					{/* Step progress */}
					{!isError && (
						<div className="w-full">
							{/* Track bar */}
							<div className="relative mb-4 flex items-center justify-between">
								<div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#E5E7EB]" />
								<div
									className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#404040] transition-all duration-500"
									style={{ width: `${progressPercent}%` }}
								/>
								{steps.map((s, i) => {
									const completed = i < resolvedIndex;
									const active = i === activeIndex && !isDone;
									return (
										<div key={s.id} className="relative z-10 flex flex-col items-center gap-1">
											<div
												className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
													completed || isDone
														? "border-[#404040] bg-[#404040]"
														: active
															? "border-[#404040] bg-white"
															: "border-[#D9D9D9] bg-white"
												}`}
											>
												{completed || isDone ? (
													<CheckCircle2 className="h-3 w-3 text-white" />
												) : active ? (
													<span className="h-2 w-2 animate-ping rounded-full bg-[#404040]" />
												) : null}
											</div>
										</div>
									);
								})}
							</div>

							{/* Step labels */}
							<div className="flex justify-between">
								{steps.map((s, i) => {
									const completed = i < resolvedIndex;
									const active = i === activeIndex && !isDone;
									return (
										<span
											key={s.id}
											className={`text-[10px] transition-colors ${
												completed || isDone
													? "font-medium text-[#404040]"
													: active
														? "font-semibold text-[#404040]"
														: "text-gray-400"
											}`}
										>
											{s.label}
										</span>
									);
								})}
							</div>
						</div>
					)}

					{/* Animated progress bar (only while busy) */}
					{!isError && !isDone && (
						<div className="w-full overflow-hidden rounded-full bg-[#E5E7EB]" style={{ height: 4 }}>
							<div
								className="h-full animate-progress rounded-full bg-[#404040]"
								style={{
									backgroundImage: "linear-gradient(90deg, #404040 0%, #888 50%, #404040 100%)",
									backgroundSize: "200% 100%",
									animation: "shimmer 1.6s linear infinite",
								}}
							/>
						</div>
					)}

					{/* Action buttons */}
					{(isError || isDone) && (
						<Button className="w-full" size="default" onClick={onClose}>
							{isDone ? "Close" : "Dismiss"}
						</Button>
					)}
				</div>
			</div>

			<style>{`
				@keyframes shimmer {
					0% { background-position: 200% 0; }
					100% { background-position: -200% 0; }
				}
			`}</style>
		</div>
	);
}
