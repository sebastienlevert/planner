import { en } from './en';
import { frCA } from './fr-CA';

export type Locale = 'en' | 'fr-CA';

export const translations = {
  en,
  'fr-CA': frCA,
};

export const localeNames: Record<Locale, string> = {
  en: 'English',
  'fr-CA': 'Français (Canada)',
};

export { en, frCA };
