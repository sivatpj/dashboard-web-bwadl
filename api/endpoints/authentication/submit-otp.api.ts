import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface SubmitOTPBody {
	email: string;
	otp: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	token: string;
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

export function useSubmitOTP(options?: MutationOptions<Response, SubmitOTPBody>) {
	const client = useAxios();
	const mutationKey = ["authentication", "submit-otp"];

	const mutationFn = async (body: SubmitOTPBody) => {
		const { data: response } = await client.get<Response>(`/user/signin-otp-verify/${body.email}/${body.otp}`);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
