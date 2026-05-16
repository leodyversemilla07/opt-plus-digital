import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './lang/en';
import fil from './lang/fil';

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources: {
            en: { translation: en },
            fil: { translation: fil },
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'fil'],
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'htmlTag', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
