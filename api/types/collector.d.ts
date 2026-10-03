export type ICollector = {
	id: number;
	crNumber: number;
	v: number;
	isCurrent: boolean;
	facilityName: string;
	collectorName: string;
	additionalInfo: any;
	allowsOverdraft?: boolean;
	batchId: null;
	createdAt: string;
	updatedAt: string;
};

export type ICollectionAdviceCollector = {
	id: number;
	crNumber: number;
	facilityName: string;
	collectorName: string;
	[key: string]: any;
};
