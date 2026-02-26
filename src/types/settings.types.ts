import type { Locale } from '../locales';
import type { ThemeName } from '../config/themes';

export interface AppSettings {
  calendarName?: string;
  locale?: Locale;
  theme?: ThemeName;
  selectedCalendars?: string[];
}
