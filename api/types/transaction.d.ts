export interface IJournalEntryLine {
	id: number;
	v: number;
	isCurrent: boolean;
	journalEntryId: number;
	accountId: number;
	lineNumber: number;
	debitAmount: number;
	creditAmount: number;
	description: string;
	createdAt: string;
	createdBy: string;
	updatedAt: string;
	updatedBy: string;
}

export interface IJournalEntry {
	id: number;
	referenceNumber: string;
	v: number;
	isCurrent: boolean;
	status: string;
	date: string;
	description: string;
	currencyCode: string;
	createdAt: string;
	createdBy: string;
	updatedAt: string;
	updatedBy: string;
	lines: IJournalEntryLine[];
	invoiceAmount?: number;
	deliveryAmount?: number;
}

export interface IPaymentTransactionJournal {
	id: number;
	v: number;
	isCurrent: boolean;
	paymentTransactionId: number;
	paymentBatchId: string;
	referenceNumber: string;
	description: string;
	fromAccount: number;
	toAccount: number;
	collectorId?: number | null;
	collectorFacilityName?: string | null;
	financierId?: number | null;
	financierFacilityName?: string | null;
	amount: number;
	journalEntryId?: number | null;
	status: string;
	reverseJournalEntryId?: number | null;
	createdAt: string;
	createdBy: string;
	createdByName?: string;
	updatedAt: string;
	updatedBy: string;
	updatedByName?: string;
}

export interface IPaymentTransaction {
	id: number;
	v: number;
	isCurrent: boolean;
	type: string;
	batchId: string;
	description: string;
	status: string;
	createdAt: string;
	createdBy: string;
	createdByName?: string;
	updatedAt: string;
	updatedBy: string;
	updatedByName?: string;
	journals: IPaymentTransactionJournal[];
}

export interface APIError {
	timestamp: string;
	success: boolean;
	route: string;
	message: string;
	errormessage?: string;
	errordetails?: {
		[key: PropertyKey]: any;
	};
}
