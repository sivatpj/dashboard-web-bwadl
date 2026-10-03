import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface LeadEmailVerifyOTPBody {
	email: string;
	otp: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	token: string;
}

export function useLeadEmailVerifyOTP(options?: MutationOptions<Response, LeadEmailVerifyOTPBody>) {
	const client = useAxios();
	const mutationKey = ["authentication", "lead-email-verify", "otp"];

	const mutationFn = async (body: LeadEmailVerifyOTPBody) => {
		const { data: response } = await client.get<Response>(`/user/lead-otp-verify/${body.email}/${body.otp}`);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
