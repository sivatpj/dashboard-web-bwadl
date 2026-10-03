export type IEscalationReport = {
	id: number;
	[key: string]: any;
};

export type IIgnoredOrder = {
	id: number;
	[key: string]: any;
};

export type IJournalEntryLine = {
	id: number;
	debitAmount?: number;
	creditAmount?: number;
	[key: string]: any;
};

export type IJournalEntry = {
	id: number;
	referenceNumber?: string;
	status?: string;
	lines?: IJournalEntryLine[];
	[key: string]: any;
};

export type IFileData = {
	id: number;
	[key: string]: any;
};

export type IFileHeader = {
	id: number;
	[key: string]: any;
};

export type ICollection = {
	id: number;
	collectorCollectionId: string;
	collectorCollectionReference: string;
	merchantReference: string;
	merchantName: string;
	type: string;
	status: string;
	pendingReview: boolean;
	amount: number;
	remainingAmount: number;
	appliedAmount: number;
	lastAppliedAmount: number;
	lastReversedAmount: number;
	subAdjustments: string;
	reason: string;
	terminalId: string;
	year: number;
	month: number;
	eligibleAt: string;
	appliedAt: string;
	transferredAt: null;
	creator: string;
	collectorCreatedAt: string;
	collectorUpdatedAt: string;
	collectorConfirmedAt: null;
	loanId: string;
	appliedOnPaymentReference: string;
	subAccountPaymentReference: string;
	additionalInfo: null;
	batchId: string;
	createdAt: string;
	updatedAt: string;
	v: number;
	isCurrent: boolean;
	invoiceId: number;
	invoiceReference?: string | null;
};
