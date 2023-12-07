import React, { useEffect, useMemo } from 'react';
import i18n from '../../../i18n';
import { useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import { LANGUAGES } from '../../../config/constants';

const LanguageDropdown = () => {
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);

    const existLanguage = LANGUAGES.find(lang => lang.value === i18n.resolvedLanguage)
    const { register, control, setValue } = useForm({
        mode: 'onChange',
        defaultValues: {
            LanguageChange: existLanguage
        }
    });
    useEffect(() => {
        if (existLanguage) {
            setSelectedLanguage(existLanguage)
            setValue("LanguageChange", existLanguage)
        } else {
            setSelectedLanguage(LANGUAGES[0])
        }

    }, [existLanguage])
    const onLanguageChange = (languageCode) => {
        setSelectedLanguage(languageCode);
        i18n.changeLanguage(languageCode.value)
    };

    return (
        <div className="language-dropdown">
            <SearchableSelectHookForm
                label={false}
                name={"LanguageChange"}
                Controller={Controller}
                control={control}
                rules={{ required: true }}
                register={register}
                placeholder={"Select"}
                defaultValue={selectedLanguage}
                options={LANGUAGES}
                customClassName={"mb-0 custom-max-width-124px"}
                mandatory={true}
                handleChange={onLanguageChange}
            />
        </div>
    );
};

export default LanguageDropdown;