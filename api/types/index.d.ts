import { UseInfiniteQueryOptions, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

export type MutationOptions<Response, Args = void> = Omit<
	UseMutationOptions<Response, AxiosError<APIError>, Args, any>,
	"mutationFn" | "mutationKey"
>;

export type QueryOptions<Response> = Omit<
	UseQueryOptions<Response, AxiosError<APIError>, Response, any>,
	"queryFn" | "queryKey"
>;

export type InfiniteQueryOptions<Response> = Omit<
	UseInfiniteQueryOptions<Response, AxiosError<APIError>, Response, Response, any>,
	"queryKey" | "queryFn"
>;

export type FormInputType<T> = Parameters<ReturnType<T>["mutate"]>[0];

export type ApiResponse<T = void> = {
	timestamp: string;
	success: boolean;
	route: string;
	message: string;
	errormessage?: string;
	errordetails?: {
		[key: PropertyKey]: any;
	};
	data: T extends void ? undefined : T;
};

export * from "./account";
export * from "./bank";
export * from "./bank-entity";
export * from "./buyer";
export * from "./collection";
export * from "./collector";
export * from "./financier";
export * from "./financier-offer";
export * from "./financier-supplier-contract";
export * from "./insurer";
export * from "./invoice";
export * from "./participant-account";
export * from "./participant-defaults";
export * from "./query-id";
export * from "./sales-order";
export * from "./statement-line";
export * from "./supplier";
export * from "./transaction";
