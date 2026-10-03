import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface LoginBody {
	email: string;
	password: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	participants: Array<{
		ParticipantId: string;
		ParticipantCrNumber: number;
		ParticipantName: string;
		ParticipantTypes: Array<{
			type: string;
			typeId: string;
			userRoles: Array<{
				id: string;
				name: string;
			}>;
		}>;
	}>;
	user: {
		identity: {
			id: string;
			type: string;
		};
		_id: string;
		email: string;
		mobile: string;
		mobileCountryCode: string;
		nameEn: string;
		nameAr: string;
		language: string;
		isEmailVerified: boolean;
		isMobileVerified: boolean;
		isUserVerified: boolean;
		userVerifiedAt: Date;
		addresses: any[];
		consents: any[];
		documents: any[];
		createdBy: string;
		createdAt: Date;
		updatedAt: Date;
		__v: number;
		sessionid: string;
	};
}

export function useSignIn(options?: MutationOptions<Response, LoginBody>) {
	const client = useAxios();
	const mutationKey = ["authentication", "sign-in"];

	const mutationFn = async (body: LoginBody) => {
		const { data: response } = await client.post<Response>(`/user/signin`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
