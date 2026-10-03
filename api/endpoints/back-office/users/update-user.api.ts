import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";
import { IAdminUser } from "./fetch-users";

type Params = {
	userId: string;
};

type Body = {
	nameEn?: string;
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
	password?: string;
	confirmPassword?: string;
};

interface Response {
	user: IAdminUser;
}

export function useUpdateUser(params: Params, options?: MutationOptions<Response, Body>) {
	const client = useAxios();
	const mutationKey = ["back-office", "users", "update"];

	const mutationFn = async (body: Body) => {
		const { data: response } = await client.put<Response>(`/user/admin/users/${params.userId}`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
