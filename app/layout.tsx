"use client";

import { AuthProvider } from "@/contexts/auth";
import "./globals.css";
import { TranslationProvider, useTranslationContext } from "@/contexts/translation";
import { composeProviders } from "@/lib/compose-providers";
import { APIClientProvider } from "@/providers/api-client";
import { DevHelpersProvider } from "@/providers/dev-helpers";
import { InitialLoaderProvider } from "@/providers/initial-loader";
import { RefreshTokenProvider } from "@/providers/refresh-token";
import { ThemeProvider } from "@/providers/theme";
import { ToasterProvider } from "@/providers/toaster";

function RootLayout(props: LayoutProps<"/">) {
	const { children } = props;
	const translation = useTranslationContext();

	return (
		<html dir={translation.direction} lang={translation.language || "ar"} suppressHydrationWarning>
			<head>
				<link href="https://fonts.googleapis.com" rel="preconnect" />
				<link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
				<link
					href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
					rel="stylesheet"
				/>
			</head>

			<body>{children}</body>
		</html>
	);
}

export default composeProviders([
	[APIClientProvider],
	[TranslationProvider],
	[RootLayout],
	[ThemeProvider, { attribute: "class", defaultTheme: "light" }], // Must be after HTMLLayout
	[AuthProvider],
	[RefreshTokenProvider],
	[InitialLoaderProvider],
	[DevHelpersProvider],
	[ToasterProvider],
]);
