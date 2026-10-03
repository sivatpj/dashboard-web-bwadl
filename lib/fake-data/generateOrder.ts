import { generateInstallment } from "./generateInstallment";

export const generateOrder = () => {
	return {
		...generateInstallment().order,
		installments: Array.from({ length: 4 })
			.map(() => generateInstallment())
			.sort((a, b) => {
				if (a.status === "Scheduled") return 1;
				if (b.status === "Scheduled") return -1;
				return 0;
			}),
	};
};
