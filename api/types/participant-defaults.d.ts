export interface IParticipantDefaults {
	participantId: number;
	participantType: "financier" | "collector" | "insurer" | "bwadl" | "supplier" | "buyer";
	financierOfferId?: number;
	collectorId?: number;
	insurerId?: number;
	bwadlId?: number;
	supplierId?: number;
	isCurrent: boolean;
	additionalInfo?: Record<string, any>;
	batchId?: string;
	createdAt: string;
	updatedAt: string;
}
