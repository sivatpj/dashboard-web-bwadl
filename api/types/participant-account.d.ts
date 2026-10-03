export type IParticipantAccount<T = "buyer" | "supplier" | "financier" | "collector" | "insurer"> = {
	id: number;
	participantType: T;
	participantBuyerReference: string;
	v: number;
	batchId: null | string;
	createdAt: string;
	updatedAt: string;
	buyerId: number;
	participantId: number;
};
