export type IAccount = {
	id: number;
	accountCode: string;
	v: number;
	isCurrent: boolean;
	accountType: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
	accountName: string;
	accountDescription: string;
	parentAccountId: number | null;
	currencyCode: string;
	balance: number;
	holdBalance: number;
	availableBalance: number;
	allowsOverdraft: boolean;
	overdraftLimit: number | null;
	overdraftFee: number;
	overdraftInterestRate: number;
	isActive: boolean;
	createdAt: string;
	createdBy: string;
	createdByName?: string;
	updatedAt: string;
	updatedBy: string;
	updatedByName?: string;
	closedAt: string | null;
	closedBy: string | null;
	closedReason: string | null;
	/** FE-only: derived from participantAccounts, not returned by the backend. */
	isOverdraftEditable?: boolean;
};

export type IAccountParticipant = {
	accountCode: string;
	participantType: "buyer" | "supplier" | "financier" | "collector" | "insurer" | "bwadl";
	purpose: "cash" | "payable";
};

export type IAccountWithParticipants = {
	account: IAccount;
	participantAccounts: IAccountParticipant[];
};

export type IBuyerAccount = {
	id: number;
	accountCode: string;
	participantId: number;
	participantType: "buyer";
	purpose: "cash" | "payable";
	accountType: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
	accountName: string;
	accountDescription: string;
	currencyCode: string;
	createdAt: string;
	createdBy: string;
	createdByName?: string;
	updatedAt: string;
	updatedBy: string;
	updatedByName?: string;
};
