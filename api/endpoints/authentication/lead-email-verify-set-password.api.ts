import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface LeadEmailSetVerifyPasswordOTPBody {
	token: string;
	password: string;
}

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
}

export function useLeadEmailVerifySetPassword(options?: MutationOptions<Response, LeadEmailSetVerifyPasswordOTPBody>) {
	const client = useAxios();
	const mutationKey = ["authentication", "lead-email-verify", "set-password"];

	const mutationFn = async (body: LeadEmailSetVerifyPasswordOTPBody) => {
		const { data: response } = await client.post<Response>(
			`/user/password-set`,
			{ password: body.password },
			{
				headers: {
					Authorization: `Bearer ${body.token}`,
				},
			},
		);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
