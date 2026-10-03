import axios from "axios";
import { useAuthContext } from "@/contexts/auth";

export const useAxios = (config?: { apiUrl?: string }) => {
	const { token, logout } = useAuthContext();

	const client = axios.create({
		baseURL: config?.apiUrl || process.env.BASE_API_URL,
		headers: { Authorization: token ? `Bearer ${token}` : undefined },
		timeout: 60000 * 10,
	});

	client.interceptors.response.use(
		response => response,
		error => {
			if (error.response.data.data === "You must be logged in" || error.response.data.error.includes("Invalid token"))
				logout();

			throw error;
		},
	);

	return client;
};
