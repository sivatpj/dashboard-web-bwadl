import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { validatePassword } from "@/lib/validate-password";

interface PasswordStepProps {
	onComplete: () => void;
	password: string;
	onChangePassword: (value: string) => void;
	confirmPassword: string;
	onChangeConfirmPassword: (value: string) => void;
	loading?: boolean;
}

export const PasswordStep = (props: PasswordStepProps) => {
	const { onComplete, password, onChangePassword, onChangeConfirmPassword, confirmPassword, loading = false } = props;

	const validity = validatePassword(password);
	const checklist = [
		{ title: "Minimum 8 characters", valid: validity.minLength },
		{ title: "1 uppercase character", valid: validity.uppercase },
		{ title: "1 lowercase character", valid: validity.lowercase },
		{ title: "1 numeric character", valid: validity.numeric },
		{ title: "1 special character", valid: validity.special },
	];

	return (
		<div className="flex flex-1 flex-col justify-between gap-8">
			<div className="flex flex-1 flex-col justify-around gap-2">
				<Input
					label="Password"
					name="password"
					type="password"
					value={password}
					onChange={e => onChangePassword(e.target.value)}
				/>

				<Input
					label="Confirm Password"
					name="confirmPassword"
					type="password"
					value={confirmPassword}
					onChange={e => onChangeConfirmPassword(e.target.value)}
				/>
			</div>

			<div className="flex flex-col gap-2">
				{checklist.map(({ title, valid }) => (
					<div
						key={title}
						className={cn("flex items-center gap-2", {
							"text-[#2B82BE]": valid,
							"text-[#595959]": !valid,
						})}
					>
						<span>{valid ? "✓" : "✕"}</span>

						<span>{title}</span>
					</div>
				))}
			</div>

			<Button
				className="px-16"
				disabled={!validity.allValid || password !== confirmPassword}
				loading={loading}
				onClick={onComplete}
			>
				Continue
			</Button>
		</div>
	);
};
