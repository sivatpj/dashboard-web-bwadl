export type ISupplier = {
	id: number;
	crNumber: number;
	v: number;
	isCurrent: boolean;
	facilityName: string;
	supplierName: string;
	//deliveryDateOffsetDays: number;
	additionalInfo: any;
	batchId: null;
	limit: number;
	calcAvailableLimit: number;
	createdAt: string;
	updatedAt: string;
	allowsOverdraft: boolean;
};
