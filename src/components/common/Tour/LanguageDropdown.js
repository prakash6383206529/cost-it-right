import React, { useEffect, useCallback } from 'react';
import i18n from '../../../i18n';
import { useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import { LANGUAGES } from '../../../config/constants';

// Constants
const STORAGE_KEY = 'selectedLanguage';
const DEFAULT_LANGUAGE = LANGUAGES[0];

const LanguageDropdown = () => {
    // Get initial language from localStorage or use default
    const getInitialLanguage = () => {
        const storedLanguage = localStorage.getItem(STORAGE_KEY);
        if (storedLanguage) {
            const parsedLanguage = JSON.parse(storedLanguage);
            const validLanguage = LANGUAGES.find(lang => lang.value === parsedLanguage.value);
            return validLanguage || DEFAULT_LANGUAGE;
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
            const parsedLanguage = JSON.parse(storedLanguage);
            // Update i18n if stored language differs from current
            if (parsedLanguage.value !== currentI18nLang) {
                i18n.changeLanguage(parsedLanguage.value);
            }
            setSelectedLanguage(parsedLanguage);
            setValue("LanguageChange", parsedLanguage);
        } else {
            // If no stored language, use i18n's resolved language
            const existLanguage = LANGUAGES.find(lang => lang.value === currentI18nLang);
            if (existLanguage) {
                setSelectedLanguage(existLanguage);
                setValue("LanguageChange", existLanguage);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(existLanguage));
            } else {
                // Fallback to default language
                setSelectedLanguage(DEFAULT_LANGUAGE);
                setValue("LanguageChange", DEFAULT_LANGUAGE);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LANGUAGE));
            }
        }
    }, [setValue]);

    // Memoized language change handler
    const onLanguageChange = useCallback((languageCode) => {
        try {
            setSelectedLanguage(languageCode);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(languageCode));
            i18n.changeLanguage(languageCode.value)
                .catch(error => {
                    console.error('Error changing language:', error);
                    // Optionally implement error handling UI
                });
        } catch (error) {
            console.error('Error saving language preference:', error);
            // Optionally implement error handling UI
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