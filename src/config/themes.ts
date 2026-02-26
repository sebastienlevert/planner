export type ThemeName = 'light' | 'dark' | 'blue' | 'purple' | 'green' | 'rose' | 'amber' | 'slate';

export interface Theme {
  name: ThemeName;
  label: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    radius: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: 'light',
    label: 'Light',
    colors: {
      background: '0 0% 98%',           // #f9fafb
      foreground: '222 84% 5%',         // #111827
      card: '0 0% 100%',                // #ffffff
      cardForeground: '222 84% 5%',     // #111827
      popover: '0 0% 100%',
      popoverForeground: '222 84% 5%',
      primary: '217 91% 60%',           // #3b82f6
      primaryForeground: '0 0% 100%',
      secondary: '220 13% 91%',         // #e5e7eb
      secondaryForeground: '222 47% 11%',
      muted: '220 13% 91%',
      mutedForeground: '215 16% 47%',   // #6b7280
      accent: '217 91% 96%',            // #dbeafe
      accentForeground: '217 91% 35%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '220 13% 91%',            // #e5e7eb
      input: '220 13% 91%',
      ring: '217 91% 60%',
      radius: '1rem',
    },
  },
  dark: {
    name: 'dark',
    label: 'Dark Mode',
    colors: {
      background: '220 20% 3%',         // #06070a - Almost black with slight blue
      foreground: '210 40% 98%',        // #f1f5f9 - Bright white text
      card: '220 15% 9%',               // #131519 - Dark elevated surface
      cardForeground: '210 40% 98%',
      popover: '220 15% 9%',
      popoverForeground: '210 40% 98%',
      primary: '217 91% 60%',           // #3b82f6 - Vibrant blue
      primaryForeground: '0 0% 100%',
      secondary: '220 13% 15%',         // #20232a - Slightly elevated
      secondaryForeground: '210 40% 98%',
      muted: '220 13% 12%',             // #1a1d23 - Muted dark areas
      mutedForeground: '215 20% 65%',   // #9ca3b0 - Muted text
      accent: '217 91% 55%',            // #2563eb - Bright accent
      accentForeground: '0 0% 100%',
      destructive: '0 72% 51%',         // #ef4444 - Red
      destructiveForeground: '0 0% 100%',
      border: '220 13% 18%',            // #262933 - Visible borders
      input: '220 13% 12%',
      ring: '217 91% 60%',
      radius: '1rem',
    },
  },
  blue: {
    name: 'blue',
    label: 'Ocean Blue',
    colors: {
      background: '199 89% 98%',        // #f0f9ff
      foreground: '199 89% 15%',        // #0c4a6e
      card: '0 0% 100%',
      cardForeground: '199 89% 15%',
      popover: '0 0% 100%',
      popoverForeground: '199 89% 15%',
      primary: '199 89% 48%',           // #0ea5e9
      primaryForeground: '0 0% 100%',
      secondary: '199 89% 90%',         // #bae6fd
      secondaryForeground: '199 89% 25%',
      muted: '199 89% 90%',
      mutedForeground: '215 14% 34%',   // #64748b
      accent: '199 89% 92%',            // #e0f2fe
      accentForeground: '199 89% 35%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '199 89% 85%',
      input: '199 89% 90%',
      ring: '199 89% 48%',
      radius: '1rem',
    },
  },
  purple: {
    name: 'purple',
    label: 'Purple',
    colors: {
      background: '271 100% 98%',       // #faf5ff
      foreground: '271 91% 27%',        // #581c87
      card: '0 0% 100%',
      cardForeground: '271 91% 27%',
      popover: '0 0% 100%',
      popoverForeground: '271 91% 27%',
      primary: '271 91% 65%',           // #a855f7
      primaryForeground: '0 0% 100%',
      secondary: '271 91% 93%',         // #e9d5ff
      secondaryForeground: '271 91% 35%',
      muted: '271 91% 93%',
      mutedForeground: '0 0% 42%',      // #6b7280
      accent: '271 100% 96%',           // #f3e8ff
      accentForeground: '271 91% 45%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '271 91% 88%',
      input: '271 91% 93%',
      ring: '271 91% 65%',
      radius: '1rem',
    },
  },
  green: {
    name: 'green',
    label: 'Forest Green',
    colors: {
      background: '160 84% 97%',        // #f0fdf4
      foreground: '160 84% 15%',        // #064e3b
      card: '0 0% 100%',
      cardForeground: '160 84% 15%',
      popover: '0 0% 100%',
      popoverForeground: '160 84% 15%',
      primary: '160 84% 39%',           // #10b981
      primaryForeground: '0 0% 100%',
      secondary: '160 84% 85%',         // #a7f3d0
      secondaryForeground: '160 84% 25%',
      muted: '160 84% 85%',
      mutedForeground: '0 0% 42%',      // #6b7280
      accent: '160 84% 90%',            // #d1fae5
      accentForeground: '160 84% 30%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '160 84% 80%',
      input: '160 84% 85%',
      ring: '160 84% 39%',
      radius: '1rem',
    },
  },
  rose: {
    name: 'rose',
    label: 'Rose',
    colors: {
      background: '350 100% 98%',       // #fff1f2
      foreground: '346 77% 20%',        // #881337
      card: '0 0% 100%',
      cardForeground: '346 77% 20%',
      popover: '0 0% 100%',
      popoverForeground: '346 77% 20%',
      primary: '346 77% 50%',           // #e11d48
      primaryForeground: '0 0% 100%',
      secondary: '350 100% 93%',        // #fecdd3
      secondaryForeground: '346 77% 30%',
      muted: '350 100% 93%',
      mutedForeground: '0 0% 42%',
      accent: '350 100% 95%',           // #ffe4e6
      accentForeground: '346 77% 40%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '350 100% 88%',
      input: '350 100% 93%',
      ring: '346 77% 50%',
      radius: '1rem',
    },
  },
  amber: {
    name: 'amber',
    label: 'Amber',
    colors: {
      background: '48 100% 98%',        // #fffbeb
      foreground: '35 92% 20%',         // #78350f
      card: '0 0% 100%',
      cardForeground: '35 92% 20%',
      popover: '0 0% 100%',
      popoverForeground: '35 92% 20%',
      primary: '43 96% 56%',            // #f59e0b
      primaryForeground: '0 0% 100%',
      secondary: '48 100% 88%',         // #fef3c7
      secondaryForeground: '35 92% 30%',
      muted: '48 100% 88%',
      mutedForeground: '0 0% 42%',
      accent: '48 100% 92%',            // #fef9c3
      accentForeground: '35 92% 35%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '48 100% 85%',
      input: '48 100% 88%',
      ring: '43 96% 56%',
      radius: '1rem',
    },
  },
  slate: {
    name: 'slate',
    label: 'Slate',
    colors: {
      background: '210 20% 98%',        // #f8fafc
      foreground: '222 47% 11%',        // #0f172a
      card: '0 0% 100%',
      cardForeground: '222 47% 11%',
      popover: '0 0% 100%',
      popoverForeground: '222 47% 11%',
      primary: '215 28% 17%',           // #334155
      primaryForeground: '0 0% 100%',
      secondary: '210 40% 96%',         // #f1f5f9
      secondaryForeground: '222 47% 11%',
      muted: '210 40% 96%',
      mutedForeground: '215 16% 47%',   // #64748b
      accent: '210 40% 96%',
      accentForeground: '222 47% 11%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '214 32% 91%',            // #e2e8f0
      input: '214 32% 91%',
      ring: '215 28% 17%',
      radius: '1rem',
    },
  },
};

export const defaultTheme: ThemeName = 'light';
