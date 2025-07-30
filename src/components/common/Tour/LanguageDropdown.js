import React, { useEffect, useCallback } from 'react';
import i18n from '../../../i18n';
import { useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import { LANGUAGES } from '../../../config/constants';

// Constants
const STORAGE_KEY = 'selectedLanguage';
const DEFAULT_LANGUAGE = LANGUAGES?.[0] || { value: 'en', label: 'English' };

const LanguageDropdown = () => {
    // Get initial language from localStorage or use default
    const getInitialLanguage = () => {
        const storedLanguage = localStorage.getItem(STORAGE_KEY);
        if (storedLanguage) {
            try {
                const parsedLanguage = JSON.parse(storedLanguage);
                const validLanguage = LANGUAGES && LANGUAGES.find(lang => lang?.value === parsedLanguage?.value);
                return validLanguage || DEFAULT_LANGUAGE;
            } catch (error) {
                // Error parsing stored language
                return DEFAULT_LANGUAGE;
            }
        }
        return DEFAULT_LANGUAGE;
    };

    const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage);
    const { register, control, setValue } = useForm({
        mode: 'onChange',
        defaultValues: {
            LanguageChange: selectedLanguage
        }
    });

    // Effect to handle initial language setup
    useEffect(() => {
        const storedLanguage = localStorage.getItem(STORAGE_KEY);
        const currentI18nLang = i18n.resolvedLanguage;
        
        if (storedLanguage) {
            try {
                const parsedLanguage = JSON.parse(storedLanguage);
                // Update i18n if stored language differs from current
                if (parsedLanguage?.value && parsedLanguage?.value !== currentI18nLang) {
                    i18n?.changeLanguage(parsedLanguage.value);
                }
                setSelectedLanguage(parsedLanguage);
                setValue?.("LanguageChange", parsedLanguage);
            } catch (error) {
                // Error parsing stored language - fallback to default
                setSelectedLanguage(DEFAULT_LANGUAGE);
                setValue?.("LanguageChange", DEFAULT_LANGUAGE);
                localStorage?.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LANGUAGE));
            }
        } else {
            // If no stored language, use i18n's resolved language
            const existLanguage = LANGUAGES && LANGUAGES.find(lang => lang?.value === currentI18nLang);
            if (existLanguage) {
                setSelectedLanguage(existLanguage);
                setValue?.("LanguageChange", existLanguage);
                localStorage?.setItem(STORAGE_KEY, JSON.stringify(existLanguage));
            } else {
                // Fallback to default language
                setSelectedLanguage(DEFAULT_LANGUAGE);
                setValue?.("LanguageChange", DEFAULT_LANGUAGE);
                localStorage?.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LANGUAGE));
            }
        }
    }, [setValue]);

    // Memoized language change handler
    const onLanguageChange = useCallback((languageCode) => {
        try {
            if (languageCode) {
                setSelectedLanguage(languageCode);
                localStorage?.setItem(STORAGE_KEY, JSON.stringify(languageCode));
                if (languageCode?.value) {
                    i18n?.changeLanguage?.(languageCode.value)
                        ?.catch(error => {
                            // Error changing language - handle silently
                        });
                }
            }
        } catch (error) {
            // Error saving language preference - handle silently
        }
    }, []);

    return (
        <div className="language-dropdown">
            <SearchableSelectHookForm
                label={false}
                name="LanguageChange"
                Controller={Controller}
                control={control}
                rules={{ required: true }}
                register={register}
                placeholder="Select"
                defaultValue={selectedLanguage}
                options={LANGUAGES}
                customClassName="mb-0 custom-max-width-124px"
                mandatory={true}
                handleChange={onLanguageChange}
                aria-label="Select Language" // Added for accessibility
            />
        </div>
    );
};

export default React.memo(LanguageDropdown); // Memoize the component