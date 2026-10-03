export const formatCurrency = (amount: number, decimals = false) => {
	return amount?.toLocaleString(undefined, {
		maximumFractionDigits: decimals ? 2 : 0,
		minimumFractionDigits: decimals ? 2 : 0,
	});
};
