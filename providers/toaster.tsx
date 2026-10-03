"use client";

import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastTitle,
	ToastViewport,
	ToastProvider as TProvider,
} from "@/components/ui/toast";
import { TOASTER_MESSAGE_DURATION_SECONDS } from "@/constants/config";
import { useToast } from "@/hooks/use-toast";

interface ToasterProviderProps {
	children: React.ReactNode;
}

export function ToasterProvider(props: ToasterProviderProps) {
	const { children } = props;

	const { toasts } = useToast();

	return (
		<TProvider duration={TOASTER_MESSAGE_DURATION_SECONDS * 1000}>
			{children}

			{toasts.map(function ({ id, title, description, action, ...props }) {
				return (
					<Toast key={id} {...props}>
						<div className="grid gap-1">
							{title && <ToastTitle>{title}</ToastTitle>}
							{description && <ToastDescription>{description}</ToastDescription>}
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</TProvider>
	);
}
