export interface IAccountingEvent {
	id: number;
	eventTypeId: number;
	service: string;
	function: string;
	parameters: Record<string, unknown>;
	v: number;
	isCurrent: boolean;
	salesOrderId: number | null;
	invoiceId: number | null;
	collectionBatchId: string | null;
	status: "New" | "Processing" | "Succeeded" | "Failed" | "Disabled";
	valueDate: string;
	attempts: number;
	maxAttempts: number;
	retryStrategy: Record<string, unknown> | null;
	lastError: string | null;
	lockedAt: string | null;
	lockedBy: string | null;
	createdAt: string;
	createdBy: string;
	updatedAt: string;
	updatedBy: string;
}
