import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";
import { IAdminUser } from "./fetch-users";

type Body = {
	nameEn: string;
	nameAr?: string;
	email?: string;
	mobile?: string;
	mobileCountryCode?: string;
	identity?: {
		id?: string;
		type?: string;
	};
	isEmailVerified?: boolean;
	isMobileVerified?: boolean;
	isUserVerified?: boolean;
	password: string;
	confirmPassword: string;
};

interface Response {
	user: IAdminUser;
}

export function useCreateUser(options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "users", "create"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.post<Response>(`/user/admin/users`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
