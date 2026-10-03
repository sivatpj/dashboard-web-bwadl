import dayjs from "dayjs";
import { ICollection } from "@/api/types";

interface Collection extends ICollection {}

export const getCollectionStatus = (collection: Collection) => {
	if (!collection) {
		return "Unknown";
	}

	const amount = Number(collection.amount || 0);
	const appliedAmount = Number(collection.appliedAmount || 0);
	const hasAmount = Number.isFinite(amount);
	const hasRemainingAmount = collection.remainingAmount !== null && Number.isFinite(Number(collection.remainingAmount));
	const remainingAmount = hasAmount
		? amount - appliedAmount
		: hasRemainingAmount
			? Number(collection.remainingAmount)
			: 0;

	const status =
		//Math.abs(Number(collection.appliedAmount)) === Math.abs(Number(collection.amount))
		remainingAmount <= 0
			? "Paid"
			: Math.abs(appliedAmount) > 0
				? "Partially Paid"
				: dayjs(collection.eligibleAt).isBefore(dayjs(), "day")
					? "Overdue"
					: "Ongoing";

	return status;
};
