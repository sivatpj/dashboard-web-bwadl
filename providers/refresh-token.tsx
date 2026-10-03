"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useRefreshToken } from "@/api/endpoints/authentication/refresh-token.api";
import { useAuthContext } from "@/contexts/auth";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";

export const RefreshTokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { refreshToken, logout, isLoggedIn, loading } = useAuthContext();
	const hasRefreshed = useRef(false);
	const { toast } = useToast();
	const { t } = useTranslationContext();

	const onError = useCallback(
		(err: any) => {
			logout();
			toast({
				description: err.response?.data.error || t("admin.common.something-went-wrong"),
				title: t("admin.common.error"),
				variant: "destructive",
			});
		},
		[logout, toast, t],
	);

	const onSuccess = useCallback(
		({ token }: { token: string }) => {
			refreshToken(token);
		},
		[refreshToken],
	);

	const { mutate } = useRefreshToken({
		onError,
		onSuccess,
		retry: false,
	});

	useEffect(() => {
		if (loading || hasRefreshed.current) return;

		if (!isLoggedIn) {
			hasRefreshed.current = true;
			return;
		}

		hasRefreshed.current = true;
		mutate();
	}, [isLoggedIn, loading, mutate]);

	return children;
};
