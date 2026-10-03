import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";
import { useToast } from "@/hooks/use-toast";

interface CredentialsStepProps {
	onComplete: () => void;
	email: string;
	password: string;
	setEmail: (email: string) => void;
	setPassword: (password: string) => void;
	loading?: boolean;
}

export const CredentialsStep = (props: CredentialsStepProps) => {
	const { onComplete, email, password, setEmail, setPassword, loading = false } = props;

	const { toast } = useToast();
	const { t } = useTranslationContext();

	return (
		<>
			<div className="flex flex-1 flex-col justify-between gap-2">
				<div className="flex flex-col gap-8">
					<Input
						label={t("auth.sign-in.email")}
						name="email"
						type="text"
						value={email}
						onChange={e => setEmail(e.target.value)}
					/>

					<Input
						label={t("auth.sign-in.password")}
						name="password"
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
					/>
				</div>

				<div className="flex justify-end">
					<Button
						className="h-0 text-sm text-[#595959] hover:underline"
						variant="link"
						onClick={() =>
							toast({
								description: t("auth.sign-in.reset-password-contact-us.description"),
								title: t("auth.sign-in.reset-password-contact-us.title"),
							})
						}
					>
						{t("auth.sign-in.forgot-password")}
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-8">
				<Button loading={loading} onClick={onComplete}>
					{t("auth.sign-in.sign-in")}
				</Button>

				<div className="flex items-center gap-2">
					<hr className="h-[1px] flex-1 border-t-0 border-t-[#595959] bg-[#595959]" />
					<span className="text-[#595959]">{t("auth.sign-in.or")}</span>
					<hr className="h-[1px] flex-1 border-t-0 border-t-[#595959] bg-[#595959]" />
				</div>

				<Button
					className="w-full"
					loading={loading}
					variant="secondary"
					onClick={() =>
						toast({
							description: t("auth.sign-in.sign-up-contact-us.description"),
							title: t("auth.sign-in.sign-up-contact-us.title"),
						})
					}
				>
					{t("auth.sign-in.sign-up")}
				</Button>
			</div>
		</>
	);
};
