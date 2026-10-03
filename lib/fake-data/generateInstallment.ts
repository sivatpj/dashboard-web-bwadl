import dayjs from "dayjs";

export const generateInstallment = (order = true) => {
	const installmentStatuses = ["Paid", "Payment Overdue", "Paid / Late", "Scheduled"];
	const orderStatuses = ["In Progress", "Delivery Confirmation", "Completed", "Cancelled"];

	return {
		amount: Math.floor(Math.random() * 1000),
		dueDate: dayjs()
			.subtract(Math.floor(Math.random() * 100), "day")
			.toISOString(),
		id: Math.random().toString(36).substring(7),
		installmentNumber: (Math.floor(Math.random() * 4) + 1) as 1 | 2 | 3 | 4,
		order: {
			amount: Math.floor(Math.random() * 5000),
			createdAt: dayjs()
				.subtract(Math.floor(Math.random() * 100), "day")
				.toISOString(),
			id: Math.random().toString(36).substring(7),
			merchant: {
				logo: "/static/assets/temp/arzaq-logo.png",
				name: "Arzaq Plus",
			},
			orderNumber: Math.floor(Math.random() * 100000),
			shippingAt: dayjs()
				.subtract(Math.floor(Math.random() * 100), "day")
				.toISOString(),
			status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)] as
				| "In Progress"
				| "Delivery Confirmation"
				| "Completed"
				| "Cancelled",
		},
		status: installmentStatuses[Math.floor(Math.random() * installmentStatuses.length)] as
			| "Paid"
			| "Payment Overdue"
			| "Paid / Late"
			| "Scheduled",
	};
};
