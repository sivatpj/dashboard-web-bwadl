"use client";

import { redirect } from "next/navigation";
import { useAuthContext } from "@/contexts/auth";

export default function Page(props: PageProps<"/">) {
	const { isLoggedIn } = useAuthContext();
	return redirect(isLoggedIn ? "/dashboard" : "/sign-in");
}
