type InputErrorProps = {
	children: React.ReactNode;
};

const InputError: React.FC<InputErrorProps> = ({ children }) => {
	if (!children) return null;

	return <div className="text-xs text-red-500">{children}</div>;
};

export { InputError };
