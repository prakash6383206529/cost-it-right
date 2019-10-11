import LocalizedStrings from 'react-localization';
import {english} from './lang/en';

export const langs = new LocalizedStrings({
    en: english
});

langs.setLanguage('en');