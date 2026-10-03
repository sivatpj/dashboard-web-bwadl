import { useQuery } from "@tanstack/react-query";
import { useAxios } from "@/api/hooks/axios";
import { QueryOptions } from "@/api/types";
//test comment to check the web hook
interface Response {
	timestamp: number;
	success: boolean;
	message: string;
	participants: [
		{
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
		},
	];
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
		userVerifiedAt: string;
		addresses: any[];
		consents: any[];
		documents: any[];
		createdBy: string;
		createdAt: string;
		updatedAt: string;
		__v: number;
	};
}

export function useFetchWhoAmI(options?: QueryOptions<Response>) {
	const client = useAxios();
	const queryKey = ["who-am-i"];

	const queryFn = async () => {
		const { data: response } = await client.get<Response>(`/user/whoami`);

		return response;
	};

	return useQuery({
		queryFn,
		queryKey,
		...options,
	});
}
