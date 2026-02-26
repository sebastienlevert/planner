import React from 'react';
import { Moon } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

export const SleepPage: React.FC = () => {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <Moon size={64} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {t.sleep.title}
        </h2>
        <p className="text-muted-foreground">
          {t.sleep.comingSoon}
        </p>
      </div>
    </div>
  );
};
