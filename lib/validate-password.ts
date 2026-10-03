const rules = {
	lowercase: /[a-z]/, // At least one lowercase letter
	minLength: /.{8,}/, // Minimum 8 characters
	numeric: /\d/, // At least one number
	special: /[^a-zA-Z\d]/, // At least one special character
	uppercase: /[A-Z]/, // At least one uppercase letter
};

export const validatePassword = (password: string) => {
	const validationResults = Object.fromEntries(
		Object.entries(rules).map(([name, regex]) => [name, regex.test(password)]),
	) as Record<keyof typeof rules | "allValid", boolean>;

	validationResults.allValid = Object.values(validationResults).every(Boolean);

	return validationResults;
};
