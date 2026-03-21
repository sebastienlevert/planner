import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

const routeTitles: Record<string, string> = {
  '/calendar': 'calendar',
  '/tasks': 'todos',
  '/meal-planner': 'mealPlanner',
  '/photos': 'photos',
  '/meals': 'meals',
  '/docs': 'docs',
  '/settings': 'settings',
};

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
  const { t } = useLocale();
  const location = useLocation();

  const currentKey = routeTitles[location.pathname] || 'calendar';
  const pageTitle = t.nav[currentKey as keyof typeof t.nav] || t.header.title;

  return (
    <header className="lg:hidden bg-card border-b border-border sticky top-0 z-30">
      <div className="flex items-center h-14 px-4">
        <button
          onClick={onMenuToggle}
          className="w-11 h-11 flex items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors touch-target -ml-1"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-2.5 ml-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
            N
          </div>
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-display font-bold text-foreground text-base">Nestly</span>
            <span className="text-sm text-muted-foreground truncate">{pageTitle}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
