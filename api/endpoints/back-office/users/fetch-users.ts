import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";

interface Params {
	q?: string;
	page?: number;
	limit?: number;
}

export interface IAdminUser {
	_id: string;
	email?: string;
	mobile?: string;
	mobileCountryCode?: string;
	nameEn?: string;
	nameAr?: string;
	language?: string;
	identity?: {
		id?: string;
		type?: string;
	};
	isEmailVerified?: boolean;
	isMobileVerified?: boolean;
	isUserVerified?: boolean;
	emailVerifiedAt?: string;
	mobileVerifiedAt?: string;
	userVerifiedAt?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface Response {
	users: IAdminUser[];
	totalCount: number;
}

export function useFetchUsers(params?: Params, options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["back-office", "users", params];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/user/admin/users`, { params });

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
