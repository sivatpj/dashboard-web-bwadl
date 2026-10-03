import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export const APIClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						retry: false,
					},
				},
			}),
	);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
