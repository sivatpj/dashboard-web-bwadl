export type IFinancierSupplierContract = {
	id: number;
	name: string;
	v: number;
	isCurrent: boolean;
	//supplierAdvancePercentage: number;
	advanceCap: number;
	calcAdvanceCap: number;
	availableAdvance: number;
	additionalInfo: any;
	batchId: null;
	createdAt: string;
	updatedAt: string;
	financierId: number;
	supplierId: number;
};
