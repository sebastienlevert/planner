import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Locale } from '../locales';
import type { TranslationKeys } from '../locales/en';
import { StorageService } from '../services/storage.service';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // Load locale from settings
    const settings = StorageService.getSettings();
    if (settings.locale) {
      setLocaleState(settings.locale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Save to settings
    const settings = StorageService.getSettings();
    StorageService.setSettings({ ...settings, locale: newLocale });
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('locale-changed'));
  };

  const value: LocaleContextType = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};
