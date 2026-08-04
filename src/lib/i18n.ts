import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import id from '../locales/id.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import ms from '../locales/ms.json';

const resources = {
  id: { translation: id },
  en: { translation: en },
  ar: { translation: ar },
  ms: { translation: ms },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? (localStorage.getItem('i18nextLng') || 'id') : 'id',
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
