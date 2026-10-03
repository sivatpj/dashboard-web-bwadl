import { Input } from "@/components/ui/input";
import { useTranslationContext } from "@/contexts/translation";

interface SupplierInputPopupProps {
	form: {
		facilityName: string;
		supplierName: string;
		crNumber: string;
		deliveryDate: string;
		phoneNumber: string;
		email: string;
	};
	handleChange: (field: string, value: string) => void;
}

export const SupplierInputPopup: React.FC<SupplierInputPopupProps> = ({ form, handleChange }) => {
	const { t } = useTranslationContext();

	return (
		<div className="flex-1">
			<div className="grid grid-cols-2 gap-x-8 gap-y-4">
				<div>
					<label className="text-sm font-medium text-[#404040]">{t("admin.suppliers.facility-name")}</label>
					<Input
						className="mt-1"
						placeholder={t("admin.suppliers.facility-name-placeholder")}
						value={form.facilityName}
						onChange={e => handleChange("facilityName", e.target.value)}
					/>
				</div>

				<div>
					<label className="text-sm font-medium text-[#404040]">{t("admin.suppliers.supplier-name")}</label>
					<Input
						className="mt-1"
						placeholder={t("admin.suppliers.supplier-name-placeholder")}
						value={form.supplierName}
						onChange={e => handleChange("supplierName", e.target.value)}
					/>
				</div>

				<div>
					<label className="text-sm font-medium text-[#404040]">{t("admin.suppliers.cr-number")}</label>
					<Input
						className="mt-1"
						placeholder={t("admin.suppliers.cr-number-placeholder")}
						value={form.crNumber}
						onChange={e => handleChange("crNumber", e.target.value)}
					/>
				</div>

				<div>
					<label className="text-sm font-medium text-[#404040]">{t("admin.suppliers.delivery-date-offset")}</label>
					<Input
						className="mt-1"
						placeholder={t("admin.suppliers.delivery-date-offset-placeholder")}
						type="number"
						value={form.deliveryDate}
						onChange={e => handleChange("deliveryDate", e.target.value)}
					/>
				</div>

				<div>
					<label className="text-sm font-medium text-[#404040]">{t("admin.suppliers.phone-number")}</label>
					<Input
						className="mt-1"
						placeholder={t("admin.suppliers.phone-number-placeholder")}
						type="string"
						value={form.phoneNumber}
						onChange={e => handleChange("phoneNumber", e.target.value)}
					/>
				</div>
				<div>
					<label className="text-sm font-medium text-[#404040]">{t("admin.suppliers.email-address")}</label>
					<Input
						className="mt-1"
						placeholder={t("admin.suppliers.email-address-placeholder")}
						value={form.email}
						onChange={e => handleChange("email", e.target.value)}
					/>
				</div>
			</div>
		</div>
	);
};
