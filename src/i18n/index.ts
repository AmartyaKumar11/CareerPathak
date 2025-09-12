import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import ur from './locales/ur.json';
import ks from './locales/ks.json';
import dg from './locales/dg.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ur: { translation: ur },
  ks: { translation: ks },
  dg: { translation: dg },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // Offline support
    load: 'languageOnly',
    preload: ['en', 'hi', 'ur', 'ks', 'dg'],
    
    react: {
      useSuspense: false, // Better for offline support
    },
  });

export default i18n;