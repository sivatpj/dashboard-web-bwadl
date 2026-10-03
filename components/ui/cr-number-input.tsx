import { Input, InputProps } from "./input";

interface CrNumberInputProps
	extends Omit<InputProps, "type" | "onChange" | "maxLength" | "minLength" | "pattern" | "inputMode"> {
	onChange?: (value: number | undefined) => void;
}

export const CrNumberInput = (props: CrNumberInputProps) => {
	const { onChange, value, ...rest } = props;

	return (
		<Input
			{...rest}
			inputMode="numeric"
			maxLength={10}
			minLength={10}
			pattern="\d{10}$"
			value={value === 0 || value === undefined ? "" : value}
			onChange={e => {
				const raw = e.target.value;
				if (raw === "") return onChange?.(undefined);
				if (isNaN(+raw)) return;
				onChange?.(+raw);
			}}
		/>
	);
};
