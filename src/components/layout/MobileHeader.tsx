import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProfilePhotos } from '../../hooks/useProfilePhotos';
import { UserAvatar } from '../common/UserAvatar';

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
  const { accounts, isAuthenticated } = useAuth();
  const photos = useProfilePhotos();
  const location = useLocation();

  const currentKey = routeTitles[location.pathname] || 'calendar';
  const pageTitle = t.nav[currentKey as keyof typeof t.nav] || t.header.title;

  return (
    <header className="lg:hidden bg-card border-b border-border sticky top-0 z-30">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center min-w-0">
          <button
            onClick={onMenuToggle}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors touch-target -ml-1"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2.5 ml-3 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              N
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-display font-bold text-foreground text-base">Nestly</span>
              <span className="text-sm text-muted-foreground truncate">{pageTitle}</span>
            </div>
          </div>
        </div>

        {isAuthenticated && accounts.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {accounts.map((account) => (
              <UserAvatar
                key={account.homeAccountId}
                name={account.name || account.username}
                photoUrl={photos[account.homeAccountId]}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
