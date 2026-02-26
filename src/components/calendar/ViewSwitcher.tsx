import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { CalendarView } from '../../types/calendar.types';
import { useLocale } from '../../contexts/LocaleContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ViewSwitcherProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const { t } = useLocale();

  const views: { value: CalendarView; labelKey: keyof typeof t.views }[] = [
    { value: 'agenda', labelKey: 'agenda' },
    { value: 'day', labelKey: 'day' },
    { value: 'week', labelKey: 'week' },
    { value: 'month', labelKey: 'month' },
  ];

  const currentViewLabel = t.views[views.find(v => v.value === currentView)?.labelKey || 'agenda'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 min-w-[140px] h-11"
        >
          <span className="text-base font-medium">{currentViewLabel}</span>
          <ChevronDown size={18} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {views.map(view => (
          <DropdownMenuItem
            key={view.value}
            onClick={() => onViewChange(view.value)}
            className="flex items-center justify-between cursor-pointer py-3 text-base"
          >
            <span>{t.views[view.labelKey]}</span>
            {currentView === view.value && (
              <Check size={16} className="text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
