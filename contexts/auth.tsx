"use client";

import { redirect, usePathname, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { config } from "@/constants/config";

type AuthContextType = {
	token: string | null;
	isLoggedIn?: boolean | null;
	logout: () => void;
	login: (token: string) => void;
	refreshToken: (token: string) => void;
	loading: boolean;
};

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const router = useRouter();
	const pathname = usePathname();
	const authRoutes = [
		"sign-in",
		"sign-up",
		"forgot-password",
		"lead-email-verify", // static
		"lead-email-verify/[jwt]", // dynamic
	];

	const cleanPath = pathname.replace(/^\/+|\/+$/g, "");
	const inAuthPages = authRoutes.some(route => {
		if (route.includes("[")) {
			return cleanPath.startsWith(route.split("/[")[0]);
		}
		return cleanPath === route;
	});

	useEffect(() => {
		const token = localStorage.getItem(config.LOCAL_STORAGE_KEYS.TOKEN);

		if (!token) {
			if (inAuthPages) {
				setLoading(false);
				return;
			}

			redirect(`/sign-in/?return=${pathname}`);
		}

		setToken(token);

		if (inAuthPages) redirect(config.LOGGED_IN_REDIRECT);

		setLoading(false);
	}, []);

	const logout = () => {
		setToken(null);
		localStorage.removeItem(config.LOCAL_STORAGE_KEYS.TOKEN);
		router.push("/sign-in");
	};

	const login = (token: string) => {
		setToken(token);
		localStorage.setItem(config.LOCAL_STORAGE_KEYS.TOKEN, token);
		const returnRoute = new URLSearchParams(window.location.search).get("return");
		router.push(returnRoute ? returnRoute.toString() : config.LOGGED_IN_REDIRECT);
	};

	const refreshToken = (token: string) => {
		setToken(token);
		localStorage.setItem(config.LOCAL_STORAGE_KEYS.TOKEN, token);
	};

	const isLoggedIn = !!token;

	return (
		<AuthContext.Provider
			value={{
				isLoggedIn,
				loading,
				login,
				logout,
				refreshToken,
				token,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}

	return context;
};
