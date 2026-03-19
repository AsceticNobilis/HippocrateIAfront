import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { type Lang, RTL_LANGS, translations } from './i18n';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  tr: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  tr: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('uiLang') as Lang;
    return saved && translations[saved] ? saved : 'fr';
  });

  useEffect(() => {
    const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const setLang = (newLang: Lang) => {
    localStorage.setItem('uiLang', newLang);
    setLangState(newLang);
  };

  const tr = (key: string): string => {
    return translations[lang]?.[key] ?? translations['fr'][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}