export type IStatementLine = {
	accountId: number;
	from: string;
	to: string;
	totalCount?: number;
	statement: [
		{
			DATE: string;
			REFERENCE: string;
			DESCRIPTION: string;
			AMOUNT: number;
			RUNNING_BALANCE: number;
		},
	];
};
