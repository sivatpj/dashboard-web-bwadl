import { FormikConfig, FormikValues, useFormik } from "formik";
import { useEffect, useState } from "react";
import { useTranslationContext } from "@/contexts/translation";

export const useForm = <T extends FormikValues>(config: FormikConfig<T>) => {
	const { language } = useTranslationContext();

	const [revalidate, setRevalidate] = useState(false);

	const { validateForm, isValidating, ...rest } = useFormik<T>(config);

	useEffect(() => {
		if (!revalidate) return;

		validateForm();
	}, [revalidate, language, validateForm]);

	useEffect(() => {
		if (isValidating) setRevalidate(true);
	}, [isValidating]);

	const setFieldValue = (field: keyof T, value: T[keyof T]) => {
		rest.setFieldValue(field as string, value);
	};

	return {
		...rest,
		isValidating,
		setFieldValue,
		validateForm,
	};
};
