import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

interface ChangePasswordBody {
	userId: string;
	password: string;
	newpassword: string;
}

interface Response {
	token: string;
	user: Record<string, unknown>;
}

export function useChangePassword(options?: MutationOptions<Response, ChangePasswordBody>) {
	const client = useAxios();
	const mutationKey = ["authentication", "change-password"];

	const mutationFn = async (body: ChangePasswordBody) => {
		const { data: response } = await client.post<Response>(`/user/password-change/${body.userId}`, {
			password: body.password,
			newpassword: body.newpassword,
		});

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
