import "dayjs/locale/ar";
import "dayjs/locale/en";
import dayjs from "dayjs";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { config } from "@/constants/config";
import * as locales from "@/locales";

type SupportedLanguages = keyof typeof locales;
export type TranslationDictionary = typeof locales.en;

type NestedKeyOf<ObjectType extends object> = {
	[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
		? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
		: `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<TranslationDictionary>;

interface TranslationContextProps {
	language: SupportedLanguages;
	t: (key: TranslationKey, variables?: Record<string, any>) => string;
	changeLanguage: (lang: SupportedLanguages) => void;
	loading: boolean;
	direction: "ltr" | "rtl";
	dayjs: typeof dayjs;
}

const TranslationContext = createContext({} as TranslationContextProps);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [language, setLanguage] = useState<SupportedLanguages>(
		config.TRANSLATION.DEFAULT_LANGUAGE as SupportedLanguages,
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedLanguage = (localStorage.getItem(config.LOCAL_STORAGE_KEYS.LANGUAGE) ||
			config.TRANSLATION.DEFAULT_LANGUAGE) as SupportedLanguages;
		setLanguage(storedLanguage);
		setLoading(false);
	}, []);

	const direction = config.TRANSLATION.RTL.includes(language) ? "rtl" : "ltr";

	const dictionary = locales[language];
	const fallbackDictionary = locales.en;

	const t = useCallback(
		(key: TranslationKey, variables?: Record<string, string | number>) => {
			const getTranslationValue = (key: string, dictionary: any): string | undefined => {
				const value = key.split(".").reduce((obj, k) => {
					if (obj && typeof obj === "object" && k in obj) {
						return obj[k];
					}
					return undefined;
				}, dictionary as any);

				if (value && typeof value === "string" && variables) {
					return value.replace(/\{\{(.*?)\}\}/g, (_, varName) => {
						return variables[varName.trim()]?.toString() || `{{${varName}}}`;
					});
				}

				return value;
			};

			const value = getTranslationValue(key, dictionary);

			if (!value) {
				return getTranslationValue(key, fallbackDictionary) || key;
			}

			return value;
		},
		[language, dictionary, fallbackDictionary],
	);

	const localeDayjs = useMemo(() => {
		dayjs.locale(language);
		return dayjs;
	}, [language]);

	const changeLanguage = (lang: SupportedLanguages) => {
		localStorage.setItem(config.LOCAL_STORAGE_KEYS.LANGUAGE, lang);
		setLanguage(lang);
	};

	return (
		<TranslationContext.Provider value={{ changeLanguage, dayjs: localeDayjs, direction, language, loading, t }}>
			{children}
		</TranslationContext.Provider>
	);
};

export const useTranslationContext = () => {
	const context = useContext(TranslationContext);

	if (!context) {
		throw new Error("useTranslation must be used within an AuthProvider");
	}

	return context;
};
