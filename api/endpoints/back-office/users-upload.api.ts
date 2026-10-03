import { useMutation } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { MutationOptions } from "@/api/types";

type UsersUploadBody = Array<{
	idNumber: number;
	idType?: string;
	fullName: string;
	email: string;
	mobile: string;
	crNumber: number;
}>;

interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	report: {
		summary: {
			dbSummary: {
				updated: number;
				inserted: number;
				total: number;
			};
			documentSummary: {
				insertedCount: number;
				matchedCount: number;
				modifiedCount: number;
				deletedCount: number;
				upsertedCount: number;
				upsertedIds: {
					[usersId: string]: string;
				};
				insertedIds: {
					[usersId: string]: string;
				};
			};
		};
		details: Array<{
			email: string;
			full_name: string;
			id_number: string;
			operation: string;
		}>;
	};
}

export function useUsersUpload(options?: MutationOptions<Response, UsersUploadBody>) {
	const client = useAxios();
	const mutationKey = ["back-office", "users-upload"];

	const mutationFn = async (body: UsersUploadBody) => {
		const { data: response } = await client.post<Response>(`/backoffice/users-upload`, body);

		return response;
	};

	return useMutation({
		mutationFn,
		mutationKey,
		...options,
	});
}
